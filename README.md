# Finance Management API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">

## Description

The **Finance Management API** is a comprehensive solution for personal and business financial tracking. Built with NestJS, this API provides robust endpoints for managing:

- User accounts and authentication
- Financial transactions with categories
- Budget planning and tracking
- Financial reporting and analytics


This RESTful API serves as the backend for finance management applications, providing secure and scalable financial data management.

## Project setup

```bash
# Install dependencies
$ npm install

# Copy environment template and configure
$ cp .env.example .env
#Then edit .env file with your database credentials and other configurations
```

#### Database Setup and Configuration

```bash
# Start development database with Docker (with data persistence)
$ npm run db:dev:up

# Start test database (without data persistence)
$ npm run db:test:up

# Apply database migrations
$ npm run prisma:dev:deploy

# Generate Prisma client (if needed)
$ npm run prisma:generate
```
#### Running the Application

```bash
# Development mode
$ npm run start:dev

# Production build
$ npm run build

# Production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

The API is documented using Swagger UI. When the application is running, access the documentation at:

```
http://localhost:3000/api/docs/
```

This provides interactive documentation where you can explore and test all available endpoints.

### Technologies Used
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Swagger** - API documentation
- **JWT** - Authentication
- **Class Validator** - Input validation

## Contributing

There is still no contributing police, but please, feel free to submit a Pull Request.

## License

This project is MIT licensed.
