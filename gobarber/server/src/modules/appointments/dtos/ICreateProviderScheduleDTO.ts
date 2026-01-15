export default interface ICreateProviderScheduleDTO {
  provider_id: string;
  date: Date;
  status: 'available' | 'unavailable';
}
