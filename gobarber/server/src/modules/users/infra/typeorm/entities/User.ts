import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import uploadConfig from '@config/upload';
import { Exclude, Expose } from 'class-transformer';
import { differenceInYears } from 'date-fns';

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  avatar: string;

  @Column({ default: 'client' })
  role: 'client' | 'psychologist';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Expose({ name: 'avatar_url' })
  getAvatarURL(): string | null {
    if (!this.avatar) {
      return null;
    }

    switch (uploadConfig.driver) {
      case 'disk':
        return `${process.env.APP_API_URL}/files/${this.avatar}`;
      case 's3':
        return `https://${uploadConfig.config.aws.bucket}s3.amazonaws.com/${this.avatar}`;
      default:
        return null;
    }
  }

  @Expose({ name: 'age' })
  getAge(): number | null {
    if (!this.birth_date) {
      return null;
    }

    return differenceInYears(new Date(), this.birth_date);
  }
}

export default User;
