import ProviderSchedule from '@modules/appointments/infra/typeorm/entities/ProviderSchedule';
import ICreateProviderScheduleDTO from '@modules/appointments/dtos/ICreateProviderScheduleDTO';
import IFindAllSchedulesInDayFromProviderDTO from '@modules/appointments/dtos/IFindAllSchedulesInDayFromProviderDTO';
import IFindAllSchedulesInMonthFromProviderDTO from '@modules/appointments/dtos/IFindAllSchedulesInMonthFromProviderDTO';

export default interface IProviderSchedulesRepository {
  findByDate(
    date: Date,
    provider_id: string,
  ): Promise<ProviderSchedule | undefined>;
  findAllInDayFromProvider(
    data: IFindAllSchedulesInDayFromProviderDTO,
  ): Promise<ProviderSchedule[]>;
  findAllInMonthFromProvider(
    data: IFindAllSchedulesInMonthFromProviderDTO,
  ): Promise<ProviderSchedule[]>;
  create(data: ICreateProviderScheduleDTO): Promise<ProviderSchedule>;
  save(schedule: ProviderSchedule): Promise<ProviderSchedule>;
}
