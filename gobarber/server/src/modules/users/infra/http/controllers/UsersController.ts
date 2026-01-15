import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateUserService from '@modules/users/services/CreateUserService';
import { classToClass } from 'class-transformer';

export default class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      first_name,
      last_name,
      email,
      cpf,
      birth_date,
      password,
      role,
    } = request.body;

    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      name,
      first_name,
      last_name,
      email,
      cpf,
      birth_date,
      password,
      role,
    });

    return response.json(classToClass(user));
  }
}
