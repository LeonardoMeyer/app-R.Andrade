import { Router } from 'express';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import ensurePsychologist from '@modules/users/infra/http/middlewares/ensurePsychologist';
import ProviderAppointmentsController from '../controllers/ProviderAppointmentsController';
import ProviderDayScheduleController from '../controllers/ProviderDayScheduleController';
import ProviderSchedulesController from '../controllers/ProviderSchedulesController';
import AppointmentAcceptController from '../controllers/AppointmentAcceptController';

const psychologistsRouter = Router();

const providerAppointmentsController = new ProviderAppointmentsController();
const providerDayScheduleController = new ProviderDayScheduleController();
const providerSchedulesController = new ProviderSchedulesController();
const appointmentAcceptController = new AppointmentAcceptController();

psychologistsRouter.use(ensureAuthenticated);
psychologistsRouter.use(ensurePsychologist);

psychologistsRouter.get('/appointments', providerAppointmentsController.index);
psychologistsRouter.get('/schedule', providerDayScheduleController.index);
psychologistsRouter.post('/schedules', providerSchedulesController.create);
psychologistsRouter.patch(
  '/appointments/:appointment_id/accept',
  appointmentAcceptController.update,
);

export default psychologistsRouter;
