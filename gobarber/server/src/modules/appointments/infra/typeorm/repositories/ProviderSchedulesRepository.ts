import { getRepository, Repository, Raw } from 'typeorm';

import IProviderSchedulesRepository from '@modules/appointments/repositories/IProviderSchedulesRepository';
import ICreateProviderScheduleDTO from '@modules/appointments/dtos/ICreateProviderScheduleDTO';
import IFindAllSchedulesInDayFromProviderDTO from '@modules/appointments/dtos/IFindAllSchedulesInDayFromProviderDTO';
import IFindAllSchedulesInMonthFromProviderDTO from '@modules/appointments/dtos/IFindAllSchedulesInMonthFromProviderDTO';

import ProviderSchedule from '../entities/ProviderSchedule';

class ProviderSchedulesRepository implements IProviderSchedulesRepository {
  private ormRepository: Repository<ProviderSchedule>;

  constructor() {
    this.ormRepository = getRepository(ProviderSchedule);
  }

  public async findByDate(
    date: Date,
    provider_id: string,
  ): Promise<ProviderSchedule | undefined> {
    const schedule = await this.ormRepository.findOne({
      where: { date, provider_id },
    });

    return schedule;
  }

  public async findAllInDayFromProvider({
    provider_id,
    day,
    month,
    year,
  }: IFindAllSchedulesInDayFromProviderDTO): Promise<ProviderSchedule[]> {
    const parsedDay = String(day).padStart(2, '0');
    const parsedMonth = String(month).padStart(2, '0');

    const schedules = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw(
          dateFieldName =>
            `to_char(${dateFieldName}, 'DD-MM-YYYY') = '${parsedDay}-${parsedMonth}-${year}'`,
        ),
      },
    });

    return schedules;
  }

  public async findAllInMonthFromProvider({
    provider_id,
    month,
    year,
  }: IFindAllSchedulesInMonthFromProviderDTO): Promise<ProviderSchedule[]> {
    const parsedMonth = String(month).padStart(2, '0');

    const schedules = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw(
          dateFieldName =>
            `to_char(${dateFieldName}, 'MM-YYYY') = '${parsedMonth}-${year}'`,
        ),
      },
    });

    return schedules;
  }

  public async create({
    provider_id,
    date,
    status,
  }: ICreateProviderScheduleDTO): Promise<ProviderSchedule> {
    const schedule = this.ormRepository.create({
      provider_id,
      date,
      status,
    });

    await this.ormRepository.save(schedule);

    return schedule;
  }

  public async save(schedule: ProviderSchedule): Promise<ProviderSchedule> {
    return this.ormRepository.save(schedule);
  }
}

export default ProviderSchedulesRepository;
