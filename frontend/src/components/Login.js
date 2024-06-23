// components/Login.js
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  font-size: 2rem;
  color: #333;
`;

const LoginButton = styled.a`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  font-size: 1rem;
  color: #fff;
  background-color: #4285f4;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357ae8;
  }
`;

function Login() {
  return (
    <Container>
      <LoginBox>
        <Title>Login</Title>
        <LoginButton href="http://localhost:3001/auth/google">
          Login with Google
        </LoginButton>
      </LoginBox>
    </Container>
  );
}

export default Login;
