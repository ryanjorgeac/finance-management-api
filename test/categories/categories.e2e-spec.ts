import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { RegisterDto } from '../../src/auth/dto';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describe('Categories E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

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
    await app.listen(3334);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3334');

    // Register and login a test user
    const registerDto: RegisterDto = {
      email: 'categories-test@email.com',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
    };

    const registerResponse = await pactum
      .spec()
      .post('/auth/register')
      .withBody(registerDto)
      .expectStatus(201);

    accessToken = registerResponse.body.access_token as string;
  });

  afterAll(async () => {
    await prisma.cleanDb();
    await app.close();
  });

  describe('POST /categories', () => {
    it('should create a new category', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Groceries',
          description: 'Food and household items',
          color: '#FF5733',
          icon: 'shopping-cart',
          budgetAmount: 50000, // R$ 500.00
          isActive: true,
        })
        .expectStatus(201)
        .expectJsonLike({
          name: 'Groceries',
          description: 'Food and household items',
          color: '#FF5733',
          icon: 'shopping-cart',
          budgetAmount: '500,00',
          isActive: true,
        })
        .stores('categoryId', 'id');
    });

    it('should create a category with minimal fields', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Transportation',
          budgetAmount: 30000, // R$ 300.00
        })
        .expectStatus(201)
        .expectJsonLike({
          name: 'Transportation',
          budgetAmount: '300,00',
        })
        .stores('categoryId2', 'id');
    });

    it('should fail without authentication', () => {
      return pactum
        .spec()
        .post('/categories')
        .withBody({
          name: 'Fail Category',
          budgetAmount: 10000,
        })
        .expectStatus(401);
    });

    it('should fail with invalid data - missing name', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          budgetAmount: 10000,
        })
        .expectStatus(400)
        .expectBodyContains('name');
    });

    it('should fail with invalid data - name too long', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'This is a very long category name that exceeds the maximum',
          budgetAmount: 10000,
        })
        .expectStatus(400)
        .expectBodyContains('name');
    });

    it('should fail with invalid budget amount - negative', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Invalid Budget',
          budgetAmount: -1000,
        })
        .expectStatus(400);
    });

    it('should create category with zero budget', () => {
      return pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Zero Budget',
          budgetAmount: 0,
        })
        .expectStatus(201)
        .expectJsonLike({
          name: 'Zero Budget',
          budgetAmount: '0,00',
        });
    });
  });

  describe('GET /categories', () => {
    it('should return all categories for the user', () => {
      return pactum
        .spec()
        .get('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expectJsonLength(4) // We created 4 categories in previous tests
        .expectJsonLike([
          {
            name: 'Groceries',
            budgetAmount: '500,00',
          },
        ]);
    });

    it('should fail without authentication', () => {
      return pactum.spec().get('/categories').expectStatus(401);
    });

    it('should return categories with summary data', () => {
      return pactum
        .spec()
        .get('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expectJsonLike([
          {
            spentAmount: '0,00',
            incomeAmount: '0,00',
            transactionCount: 0,
          },
        ]);
    });
  });

  describe('GET /categories/summary', () => {
    it('should return financial summary of all categories', () => {
      return pactum
        .spec()
        .get('/categories/summary')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expectJsonLike({
          totalBudget: '830,00', // Sum of all budgets created
          totalSpent: '0,00',
          remainingBudget: '830,00',
        });
    });

    it('should fail without authentication', () => {
      return pactum.spec().get('/categories/summary').expectStatus(401);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a specific category', () => {
      return pactum
        .spec()
        .get('/categories/$S{categoryId}')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{categoryId}',
          name: 'Groceries',
        });
    });

    it('should fail with invalid UUID', () => {
      return pactum
        .spec()
        .get('/categories/invalid-uuid')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(400);
    });

    it('should fail with non-existent category', () => {
      return pactum
        .spec()
        .get('/categories/123e4567-e89b-12d3-a456-426614174000')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(404);
    });

    it('should fail without authentication', () => {
      return pactum.spec().get('/categories/$S{categoryId}').expectStatus(401);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update category name', () => {
      return pactum
        .spec()
        .patch('/categories/$S{categoryId}')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Updated Groceries',
        })
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{categoryId}',
          name: 'Updated Groceries',
          budgetAmount: '500,00', // Budget should remain unchanged
        });
    });

    it('should update budget amount', () => {
      return pactum
        .spec()
        .patch('/categories/$S{categoryId}')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          budgetAmount: 60000, // R$ 600.00
        })
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{categoryId}',
          budgetAmount: '600,00',
          name: 'Updated Groceries', // Name should remain from previous update
        });
    });

    it('should update multiple fields', () => {
      return pactum
        .spec()
        .patch('/categories/$S{categoryId2}')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Updated Transportation',
          description: 'Car, bus, and other transport',
          budgetAmount: 40000, // R$ 400.00
          color: '#00FF00',
        })
        .expectStatus(200)
        .expectJsonLike({
          name: 'Updated Transportation',
          description: 'Car, bus, and other transport',
          budgetAmount: '400,00',
          color: '#00FF00',
        });
    });

    it('should fail with invalid UUID', () => {
      return pactum
        .spec()
        .patch('/categories/invalid-uuid')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({ name: 'Test' })
        .expectStatus(400);
    });

    it('should fail with non-existent category', () => {
      return pactum
        .spec()
        .patch('/categories/123e4567-e89b-12d3-a456-426614174000')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({ name: 'Test' })
        .expectStatus(404);
    });

    it('should fail without authentication', () => {
      return pactum
        .spec()
        .patch('/categories/$S{categoryId}')
        .withBody({ name: 'Test' })
        .expectStatus(401);
    });

    it('should fail with invalid data - name too long', () => {
      return pactum
        .spec()
        .patch('/categories/$S{categoryId}')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'This is a very long category name that exceeds the maximum',
        })
        .expectStatus(400);
    });
  });

  describe('DELETE /categories/:id', () => {
    let categoryToDelete: string;

    beforeAll(async () => {
      // Create a category specifically for deletion test
      const response = await pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'To Be Deleted',
          budgetAmount: 10000,
        })
        .expectStatus(201);

      categoryToDelete = response.body.id as string;
    });

    it('should delete a category with no transactions', () => {
      return pactum
        .spec()
        .delete(`/categories/${categoryToDelete}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(204);
    });

    it('should confirm category was deleted', () => {
      return pactum
        .spec()
        .get(`/categories/${categoryToDelete}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(404);
    });

    it('should fail with invalid UUID', () => {
      return pactum
        .spec()
        .delete('/categories/invalid-uuid')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(400);
    });

    it('should fail with non-existent category', () => {
      return pactum
        .spec()
        .delete('/categories/123e4567-e89b-12d3-a456-426614174000')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(404);
    });

    it('should fail without authentication', () => {
      return pactum
        .spec()
        .delete('/categories/$S{categoryId}')
        .expectStatus(401);
    });
  });

  describe('Multi-user isolation', () => {
    let secondUserToken: string;
    let secondUserCategoryId: string;

    beforeAll(async () => {
      // Register second user
      const registerDto: RegisterDto = {
        email: 'second-user@email.com',
        password: 'password123',
        firstName: 'Second',
        lastName: 'User',
      };

      const response = await pactum
        .spec()
        .post('/auth/register')
        .withBody(registerDto)
        .expectStatus(201);

      secondUserToken = response.body.access_token as string;

      // Create category for second user
      const categoryResponse = await pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${secondUserToken}`)
        .withBody({
          name: 'Second User Category',
          budgetAmount: 20000,
        })
        .expectStatus(201);

      secondUserCategoryId = categoryResponse.body.id as string;
    });

    it('first user should not see second user categories', () => {
      return pactum
        .spec()
        .get('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expect((ctx) => {
          const categories = ctx.res.body as Array<{ name: string }>;
          const hasSecondUserCategory = categories.some(
            (cat) => cat.name === 'Second User Category',
          );
          expect(hasSecondUserCategory).toBe(false);
        });
    });

    it('first user should not access second user category', () => {
      return pactum
        .spec()
        .get(`/categories/${secondUserCategoryId}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(403);
    });

    it('first user should not update second user category', () => {
      return pactum
        .spec()
        .patch(`/categories/${secondUserCategoryId}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({ name: 'Hacked' })
        .expectStatus(403);
    });

    it('first user should not delete second user category', () => {
      return pactum
        .spec()
        .delete(`/categories/${secondUserCategoryId}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(403);
    });
  });

  describe('Category with transactions', () => {
    let categoryWithTransactions: string;

    beforeAll(async () => {
      // Create a category
      const categoryResponse = await pactum
        .spec()
        .post('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          name: 'Category With Transactions',
          budgetAmount: 50000,
        })
        .expectStatus(201);

      categoryWithTransactions = categoryResponse.body.id;

      // Create transactions for this category
      await pactum
        .spec()
        .post('/transactions')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          amount: 10000,
          type: 'EXPENSE',
          description: 'Test transaction',
          date: new Date().toISOString(),
          categoryId: categoryWithTransactions,
        })
        .expectStatus(201);

      await pactum
        .spec()
        .post('/transactions')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .withBody({
          amount: 5000,
          type: 'EXPENSE',
          description: 'Another transaction',
          date: new Date().toISOString(),
          categoryId: categoryWithTransactions,
        })
        .expectStatus(201);
    });

    it('should show correct spent amount in category', () => {
      return pactum
        .spec()
        .get(`/categories/${categoryWithTransactions}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200)
        .expectJsonLike({
          spentAmount: '150,00', // 100 + 50
          transactionCount: 2,
          remainingAmount: '350,00', // 500 - 150
        });
    });

    it('should delete category and reassign transactions', async () => {
      await pactum
        .spec()
        .delete(`/categories/${categoryWithTransactions}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(204);

      // Verify category was deleted
      await pactum
        .spec()
        .get(`/categories/${categoryWithTransactions}`)
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(404);

      // Check if "Sem categoria" category was created
      const categories = await pactum
        .spec()
        .get('/categories')
        .withHeaders('Authorization', `Bearer ${accessToken}`)
        .expectStatus(200);

      const uncategorized = (
        categories.body as Array<{
          name: string;
          transactionCount: number;
        }>
      ).find((cat) => cat.name === 'Sem categoria');

      expect(uncategorized).toBeDefined();
      expect(uncategorized?.transactionCount).toBeGreaterThanOrEqual(2);
    });
  });
});
