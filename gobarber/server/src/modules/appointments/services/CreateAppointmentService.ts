import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import IProviderSchedulesRepository from '../repositories/IProviderSchedulesRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';

import Appointment from '../infra/typeorm/entities/Appointment';

interface IRequest {
  user_id: string;
  provider_id: string;
  date: Date;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('ProviderSchedulesRepository')
    private providerSchedulesRepository: IProviderSchedulesRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({
    date,
    user_id,
    provider_id,
  }: IRequest): Promise<Appointment> {
    const appointmentDate = startOfHour(date);

    if (isBefore(appointmentDate, Date.now())) {
      throw new AppError("Can't create an appointment on a past date.");
    }

    if (user_id === provider_id) {
      throw new AppError("You can't create an appointment with yourself.");
    }

    const provider = await this.usersRepository.findById(provider_id);
    const user = await this.usersRepository.findById(user_id);

    if (!provider || provider.role !== 'psychologist') {
      throw new AppError('Selected provider is not a psychologist.');
    }

    if (!user || user.role !== 'client') {
      throw new AppError('Only clients can create appointments.');
    }

    const appointmentHour = getHours(appointmentDate);
    const isDefaultHour = appointmentHour >= 12 && appointmentHour <= 19;

    const schedule = await this.providerSchedulesRepository.findByDate(
      appointmentDate,
      provider_id,
    );

    const isSlotAvailable = schedule
      ? schedule.status === 'available'
      : isDefaultHour;

    if (!isSlotAvailable) {
      throw new AppError('This appointment time is not available.');
    }

    const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
      appointmentDate,
      provider_id,
    );

    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    const appointment = await this.appointmentsRepository.create({
      user_id,
      provider_id,
      date: appointmentDate,
      status: 'pending',
    });

    const formattedDate = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm");

    await this.notificationsRepository.create({
      recipient_id: provider_id,
      content: `Novo agendamento para ${formattedDate}`,
    });

    await this.cacheProvider.invalidate(
      `provider-appointments:${provider_id}:${format(
        appointmentDate,
        'yyyy-M-d',
      )}`,
    );

    return appointment;
  }
}

export default CreateAppointmentService;
