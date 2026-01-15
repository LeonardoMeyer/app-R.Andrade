import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import ListProviderDayScheduleService from '@modules/appointments/services/ListProviderDayScheduleService';

export default class ProviderDayScheduleController {
  public async index(request: Request, response: Response): Promise<Response> {
    const provider_id = request.user.id;
    const { day, month, year } = request.query;

    const listProviderDaySchedule = container.resolve(
      ListProviderDayScheduleService,
    );

    const schedule = await listProviderDaySchedule.execute({
      provider_id,
      year: Number(year),
      month: Number(month),
      day: Number(day),
    });

    return response.json(classToClass(schedule));
  }
}
