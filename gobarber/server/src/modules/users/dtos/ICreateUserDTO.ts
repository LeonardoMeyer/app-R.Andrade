export default interface ICreateUserDTO {
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  cpf?: string;
  birth_date?: Date;
  password: string;
  role: 'client' | 'psychologist';
}
