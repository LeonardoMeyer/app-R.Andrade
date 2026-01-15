import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import Appointment from '@modules/appointments/infra/typeorm/entities/Appointment';

interface IRequest {
  appointment_id: string;
  provider_id: string;
}

@injectable()
class AcceptAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,
  ) {}

  public async execute({
    appointment_id,
    provider_id,
  }: IRequest): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findById(
      appointment_id,
    );

    if (!appointment) {
      throw new AppError('Appointment not found.');
    }

    if (appointment.provider_id !== provider_id) {
      throw new AppError('You can only accept your own appointments.');
    }

    if (appointment.status === 'accepted') {
      return appointment;
    }

    appointment.status = 'accepted';

    return this.appointmentsRepository.save(appointment);
  }
}

export default AcceptAppointmentService;
