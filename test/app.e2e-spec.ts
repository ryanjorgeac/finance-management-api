import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { LoginDto, RegisterDto } from '../src/auth/dto';
import { PrismaService } from '../src/database/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const registerDto: RegisterDto = {
      email: 'teste@email.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    };
    describe('Register', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerDto)
          .expectStatus(201)
          .expectBodyContains('access_token');
      });

      it('should not signup with the same email', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerDto)
          .expectStatus(401)
          .expectBodyContains('Cannot create a user with provided e-mail');
      });

      it('should not signup with invalid email', () => {
        const wrongRegisterDto: RegisterDto = Object.assign({}, registerDto, {
          email: 'wrongemail',
        });
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(wrongRegisterDto)
          .expectStatus(400)
          .expectBodyContains('email must be an email');
      });

      it('should not signup with invalid password', () => {
        const wrongRegisterDto: RegisterDto = Object.assign({}, registerDto, {
          password: 'short',
        });
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(wrongRegisterDto)
          .expectStatus(400)
          .expectBodyContains(
            'password must be longer than or equal to 6 characters',
          );
      });

      it('should not signup with no firstName', () => {
        const wrongRegisterDto: RegisterDto = Object.assign({}, registerDto, {
          firstName: '',
        });
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(wrongRegisterDto)
          .expectStatus(400)
          .expectBodyContains('firstName should not be empty');
      });

      it('should not signup with no lastName', () => {
        const wrongRegisterDto: RegisterDto = Object.assign({}, registerDto, {
          lastName: '',
        });
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(wrongRegisterDto)
          .expectStatus(400)
          .expectBodyContains('lastName should not be empty');
      });

      it('should not signup with no DTO', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({})
          .expectStatus(400)
          .expectBodyContains('error');
      });
    });

    describe('Login', () => {
      it('should login', () => {
        const loginDto: LoginDto = {
          email: registerDto.email,
          password: registerDto.password,
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(loginDto)
          .expectStatus(200)
          .expectBodyContains('access_token');
      });

      it('should not login with invalid credentials', () => {
        const loginDto: LoginDto = {
          email: registerDto.email,
          password: 'wrongpassword',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(loginDto)
          .expectStatus(401)
          .expectBodyContains('Invalid credentials');
      });

      it('should not login with invalid email', () => {
        const loginDto: LoginDto = {
          email: 'wrongemail',
          password: 'wrongpassword',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(loginDto)
          .expectStatus(400)
          .expectBodyContains('email must be an email');
      });

      it('should not login with no dto', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({})
          .expectStatus(400)
          .expectBodyContains('error');
      });
    });
  });

  describe('User', () => {
    describe('Get Profile', () => {});

    describe('Update user', () => {});

    describe('Delete user', () => {});
  });

  describe('Accounts', () => {
    describe('Create new account', () => {});

    describe('Update account', () => {});

    describe('Delete account', () => {});
  });

  describe('Categories', () => {
    describe('Create', () => {});

    describe('Update', () => {});

    describe('Delete', () => {});
  });

  describe('Transactions', () => {
    describe('Create', () => {});

    describe('Update', () => {});

    describe('Delete', () => {});
  });
});
