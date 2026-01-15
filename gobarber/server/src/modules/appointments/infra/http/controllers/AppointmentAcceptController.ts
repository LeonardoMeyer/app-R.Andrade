import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AcceptAppointmentService from '@modules/appointments/services/AcceptAppointmentService';

export default class AppointmentAcceptController {
  public async update(request: Request, response: Response): Promise<Response> {
    const provider_id = request.user.id;
    const { appointment_id } = request.params;

    const acceptAppointment = container.resolve(AcceptAppointmentService);

    const appointment = await acceptAppointment.execute({
      appointment_id,
      provider_id,
    });

    return response.json(classToClass(appointment));
  }
}
