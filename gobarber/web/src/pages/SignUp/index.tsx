import React, { useCallback, useRef } from 'react';
import {
  FiArrowLeft,
  FiMail,
  FiUser,
  FiLock,
  FiHash,
  FiCalendar,
} from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';

import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, Background, AnimationContainer } from './styles';

interface SignUpFormData {
  first_name: string;
  last_name: string;
  email: string;
  cpf: string;
  birth_date: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
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
          password: Yup.string().min(6, 'No mínimo 6 dígitos'),
        });

        await schema.validate(data, { abortEarly: false });

        const { first_name, last_name, email, cpf, birth_date, password } = data;

        await api.post('/users', {
          name: `${first_name} ${last_name}`.trim(),
          first_name,
          last_name,
          email,
          cpf,
          birth_date,
          password,
        });

        history.push('/');

        addToast({
          type: 'success',
          title: 'Cadastro realizado!',
          description: 'Você já pode fazer seu login no GoBarber',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro no cadastro',
          description: 'Ocorreu um erro ao fazer o cadastro, tente novamente',
        });
      }
    },
    [addToast, history],
  );

  return (
    <Container>
      <Background />
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu cadastro</h1>

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
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Senha"
            />

            <Button type="submit">Cadastrar</Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
            Voltar para login
          </Link>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default SignUp;
