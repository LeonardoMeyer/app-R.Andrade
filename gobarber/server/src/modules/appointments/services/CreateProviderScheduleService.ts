import { injectable, inject } from 'tsyringe';
import { isBefore, startOfHour } from 'date-fns';

import AppError from '@shared/errors/AppError';

import IProviderSchedulesRepository from '@modules/appointments/repositories/IProviderSchedulesRepository';
import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';

import ProviderSchedule from '@modules/appointments/infra/typeorm/entities/ProviderSchedule';

interface IRequest {
  provider_id: string;
  date: Date;
  status: 'available' | 'unavailable';
}

@injectable()
class CreateProviderScheduleService {
  constructor(
    @inject('ProviderSchedulesRepository')
    private providerSchedulesRepository: IProviderSchedulesRepository,

    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,
  ) {}

  public async execute({
    provider_id,
    date,
    status,
  }: IRequest): Promise<ProviderSchedule> {
    const scheduleDate = startOfHour(date);

    if (isBefore(scheduleDate, Date.now())) {
      throw new AppError("Can't edit a schedule in the past.");
    }

    const existingAppointment = await this.appointmentsRepository.findByDate(
      scheduleDate,
      provider_id,
    );

    if (existingAppointment && status === 'unavailable') {
      throw new AppError('This time already has an appointment.');
    }

    const existingSchedule = await this.providerSchedulesRepository.findByDate(
      scheduleDate,
      provider_id,
    );

    if (existingSchedule) {
      existingSchedule.status = status;
      return this.providerSchedulesRepository.save(existingSchedule);
    }

    return this.providerSchedulesRepository.create({
      provider_id,
      date: scheduleDate,
      status,
    });
  }
}

export default CreateProviderScheduleService;
