import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';

export default async function ensurePsychologist(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const usersRepository = container.resolve<IUsersRepository>('UsersRepository');

  const user = await usersRepository.findById(request.user.id);

  if (!user || user.role !== 'psychologist') {
    throw new AppError('User is not a psychologist.', 403);
  }

  return next();
}
