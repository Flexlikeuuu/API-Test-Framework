import { faker } from '@faker-js/faker';

/**
 * Universal Data Generator for generating synthetic test data
 */
export class DataGenerator {
  /**
   * Generates a realistic mock user payload
   * @param {object} overrides - Custom property overrides
   */
  static generateUser(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      firstName,
      lastName,
      username: faker.internet.username({ firstName, lastName }),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: false }),
      age: faker.number.int({ min: 18, max: 70 }),
      phone: faker.phone.number(),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      birthDate: faker.date.birthdate().toISOString().split('T')[0],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      ...overrides,
    };
  }

  /**
   * Generates a mock post/article payload
   * @param {object} overrides - Custom property overrides
   */
  static generatePost(overrides = {}) {
    return {
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      body: faker.lorem.paragraphs({ min: 1, max: 3 }),
      userId: faker.number.int({ min: 1, max: 100 }),
      tags: faker.helpers.arrayElements(['tech', 'news', 'lifestyle', 'qa', 'automation', 'javascript'], 2),
      reactions: {
        likes: faker.number.int({ min: 0, max: 500 }),
        dislikes: faker.number.int({ min: 0, max: 50 }),
      },
      ...overrides,
    };
  }

  /**
   * Generates a mock product payload
   * @param {object} overrides - Custom property overrides
   */
  static generateProduct(overrides = {}) {
    return {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      discountPercentage: faker.number.float({ min: 1, max: 30, fractionDigits: 2 }),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 2 }),
      stock: faker.number.int({ min: 0, max: 200 }),
      brand: faker.company.name(),
      category: faker.commerce.department().toLowerCase(),
      ...overrides,
    };
  }

  /**
   * Generates a random UUID v4
   */
  static randomUUID() {
    return faker.string.uuid();
  }

  /**
   * Generates a random alphanumeric string
   * @param {number} length
   */
  static randomString(length = 10) {
    return faker.string.alphanumeric(length);
  }

  /**
   * Generates random integer between min and max
   */
  static randomInt(min = 1, max = 100) {
    return faker.number.int({ min, max });
  }

  /**
   * Direct access to full faker instance
   */
  static get faker() {
    return faker;
  }
}
