import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateProviderScheduleService from '@modules/appointments/services/CreateProviderScheduleService';

export default class ProviderSchedulesController {
  public async create(request: Request, response: Response): Promise<Response> {
    const provider_id = request.user.id;
    const { date, status } = request.body;

    const createProviderSchedule = container.resolve(
      CreateProviderScheduleService,
    );

    const schedule = await createProviderSchedule.execute({
      provider_id,
      date,
      status,
    });

    return response.json(schedule);
  }
}
