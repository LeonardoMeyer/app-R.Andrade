import { injectable, inject } from 'tsyringe';
import { getHours, isAfter } from 'date-fns';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import IProviderSchedulesRepository from '@modules/appointments/repositories/IProviderSchedulesRepository';
import Appointment from '@modules/appointments/infra/typeorm/entities/Appointment';

interface IRequest {
  provider_id: string;
  day: number;
  month: number;
  year: number;
}

type IResponse = Array<{
  hour: number;
  available: boolean;
  appointment: Appointment | null;
}>;

@injectable()
class ListProviderDayScheduleService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('ProviderSchedulesRepository')
    private providerSchedulesRepository: IProviderSchedulesRepository,
  ) {}

  public async execute({
    provider_id,
    year,
    month,
    day,
  }: IRequest): Promise<IResponse> {
    const appointments = await this.appointmentsRepository.findAllInDayFromProvider(
      {
        provider_id,
        year,
        month,
        day,
      },
    );

    const schedules = await this.providerSchedulesRepository.findAllInDayFromProvider(
      {
        provider_id,
        year,
        month,
        day,
      },
    );

    const defaultHours = Array.from({ length: 8 }, (_, index) => index + 12);
    const availableHours = new Set<number>(defaultHours);

    schedules.forEach(schedule => {
      const scheduleHour = getHours(schedule.date);

      if (schedule.status === 'available') {
        availableHours.add(scheduleHour);
        return;
      }

      availableHours.delete(scheduleHour);
    });

    const eachHourArray = Array.from(availableHours).sort((a, b) => a - b);
    const currentDate = new Date(Date.now());

    return eachHourArray.map(hour => {
      const appointment = appointments.find(
        appointmentItem => getHours(appointmentItem.date) === hour,
      );

      const appointmentDate = new Date(year, month - 1, day, hour);

      return {
        hour,
        available: !appointment && isAfter(appointmentDate, currentDate),
        appointment: appointment || null,
      };
    });
  }
}

export default ListProviderDayScheduleService;
