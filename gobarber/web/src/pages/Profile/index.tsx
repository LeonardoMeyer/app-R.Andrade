import React, { useCallback, useRef, ChangeEvent, useMemo } from 'react';
import {
  FiMail,
  FiUser,
  FiLock,
  FiCamera,
  FiArrowLeft,
  FiHash,
  FiCalendar,
} from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, AvatarInput } from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  cpf: string;
  birth_date: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const { user, updateUser } = useAuth();
  const history = useHistory();

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          first_name: Yup.string().required('Nome obrigatório'),
          last_name: Yup.string().required('Sobrenome obrigatório'),
          email: Yup.string()
            .required('Email obrigatório')
            .email('Digite um e-mail válido'),
          cpf: Yup.string().required('CPF obrigatório'),
          birth_date: Yup.string().required('Data de nascimento obrigatória'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val.length,
            then: Yup.string().min(6).required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => !!val.length,
              then: Yup.string().min(6).required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password')], 'Confirmação incorreta'),
        });

        await schema.validate(data, { abortEarly: false });

        const {
          first_name,
          last_name,
          email,
          cpf,
          birth_date,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name: `${first_name} ${last_name}`.trim(),
          first_name,
          last_name,
          email,
          cpf,
          birth_date,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        history.push('/dashboard');

        addToast({
          type: 'success',
          title: 'Perfil atualizado!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro ao atualizar perfil',
          description:
            'Ocorreu um erro ao atualizar o seu cadastro, tente novamente',
        });
      }
    },
    [addToast, history],
  );

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        api.patch('/users/avatar', data).then(response => {
          updateUser(response.data);

          addToast({
            type: 'success',
            title: 'Avatar atualizado!',
          });
        });
      }
    },
    [addToast, updateUser],
  );

  const birthDateValue = useMemo(() => {
    if (!user.birth_date) {
      return undefined;
    }

    return format(parseISO(user.birth_date), 'yyyy-MM-dd');
  }, [user.birth_date]);

  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>

      <Content>
        <Form
          ref={formRef}
          initialData={{
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            cpf: user.cpf,
            birth_date: birthDateValue,
          }}
          onSubmit={handleSubmit}
        >
          <AvatarInput>
            <img src={user.avatar_url} alt={user.name} />
            <label htmlFor="avatar">
              <FiCamera />

              <input type="file" id="avatar" onChange={handleAvatarChange} />
            </label>
          </AvatarInput>

          <h1>Meu perfil</h1>
          {user.age !== undefined && <span>Idade: {user.age} anos</span>}

          <Input name="first_name" icon={FiUser} placeholder="Nome" />
          <Input name="last_name" icon={FiUser} placeholder="Sobrenome" />
          <Input name="email" icon={FiMail} placeholder="E-mail" />
          <Input name="cpf" icon={FiHash} placeholder="CPF" />
          <Input
            name="birth_date"
            icon={FiCalendar}
            type="date"
            placeholder="Nascimento"
          />

          <Input
            containerStyle={{ marginTop: 24 }}
            name="old_password"
            icon={FiLock}
            type="password"
            placeholder="Senha atual"
          />
          <Input
            name="password"
            icon={FiLock}
            type="password"
            placeholder="Nova senha"
          />
          <Input
            name="password_confirmation"
            icon={FiLock}
            type="password"
            placeholder="Confirmar senha"
          />

          <Button type="submit">Salvar alterações</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;
