import { Request, Response, NextFunction } from 'express';

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    data: [
      { id: 1, content: "Welcome to Bornblix chat! How can Bōōns help you grow today?", isFromBoon: true }
    ]
  });
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;
  res.json({
    success: true,
    message: "Message sent and synced",
    data: { content, timestamp: new Date(), isFromBoon: false }
  });
};
