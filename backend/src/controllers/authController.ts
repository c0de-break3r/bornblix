import type { Request, Response, NextFunction } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import { clerkClient, getAuth } from '@clerk/express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import Chat from '../models/Chat';

function primaryEmailFromClerkUser(data: {
  id?: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  primary_email_address_id?: string | null;
}): string {
  const emails = data.email_addresses ?? [];
  const match = emails.find((e) => e.id === data.primary_email_address_id);
  return (
    match?.email_address ??
    emails[0]?.email_address ??
    `${data.id ?? 'unknown'}@users.bornblix.app`
  );
}

async function upsertUserFromClerkPayload(
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string;
  }
): Promise<void> {
  const email = primaryEmailFromClerkUser(data);

  await User.findOneAndUpdate(
    { clerkId: data.id },
    {
      clerkId: data.id,
      email,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      avatar: data.image_url ?? undefined,
      lastVisitDate: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/**
 * Clerk webhook — mount with `express.raw({ type: 'application/json' })` only on this path.
 */
export async function handleClerkWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const evt = await verifyWebhook(req);
    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        await upsertUserFromClerkPayload(evt.data);
        break;
      case 'user.deleted':
        await User.deleteOne({ clerkId: evt.data.id });
        await Chat.deleteMany({ participants: evt.data.id });
        break;
      default:
        break;
    }
    res.status(200).json({ success: true });
  } catch {
    next(new AppError('Webhook verification failed', 400));
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const u = await clerkClient.users.getUser(auth.userId);
    const email =
      u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      '';

    res.json({
      success: true,
      data: {
        clerkId: u.id,
        email,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
      },
    });
  } catch (e) {
    next(e);
  }
}
