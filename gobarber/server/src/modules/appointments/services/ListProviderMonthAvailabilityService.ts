import { injectable, inject } from 'tsyringe';
import { getDaysInMonth, getDate, isAfter } from 'date-fns';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import IProviderSchedulesRepository from '@modules/appointments/repositories/IProviderSchedulesRepository';

interface IRequest {
  provider_id: string;
  month: number;
  year: number;
}

type IResponse = Array<{
  day: number;
  available: boolean;
}>;

@injectable()
class ListProviderMonthAvailabilityService {
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
  }: IRequest): Promise<IResponse> {
    const appointments = await this.appointmentsRepository.findAllInMonthFromProvider(
      {
        provider_id,
        year,
        month,
      },
    );

    const schedules = await this.providerSchedulesRepository.findAllInMonthFromProvider(
      {
        provider_id,
        year,
        month,
      },
    );

    const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1));

    const eachDayArray = Array.from(
      { length: numberOfDaysInMonth },
      (_, index) => index + 1,
    );

    const availability = eachDayArray.map(day => {
      const compareDate = new Date(year, month - 1, day, 23, 59, 59);

      const appointmentsInDay = appointments.filter(appointment => {
        return getDate(appointment.date) === day;
      });

      const schedulesInDay = schedules.filter(schedule => {
        return getDate(schedule.date) === day;
      });

      const defaultHoursCount = 8;
      const availableHours = new Set<number>(
        Array.from({ length: defaultHoursCount }, (_, index) => index + 12),
      );

      schedulesInDay.forEach(schedule => {
        const scheduleHour = schedule.date.getHours();

        if (schedule.status === 'available') {
          availableHours.add(scheduleHour);
          return;
        }

        availableHours.delete(scheduleHour);
      });

      return {
        day,
        available:
          isAfter(compareDate, new Date(Date.now())) &&
          appointmentsInDay.length < availableHours.size,
      };
    });

    return availability;
  }
}

export default ListProviderMonthAvailabilityService;
