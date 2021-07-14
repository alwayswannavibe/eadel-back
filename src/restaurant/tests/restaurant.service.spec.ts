import { MockRepository } from '@app/common/types/mockRepository.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { RestaurantService } from '@app/restaurant/restaurant.service';
import { UserRole } from '@app/user/types/userRole.type';
import { Errors } from '@app/common/constants/errors';
import { ENTITIES_PER_PAGE } from '@app/common/constants/entitiesPerPage';
import { ILike } from 'typeorm';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
};

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;
  let restaurantRepository: MockRepository<RestaurantEntity>;
  let categoryRepository: MockRepository<CategoryEntity>;

  const userData = {
    email: 'test@gmail.com',
    role: UserRole.Owner,
    password: '123',
    restaurants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    id: 1,
  };

  const categoryData = {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: 1,
    slug: 'test-category',
    restaurants: [],
    name: 'test category',
  };

  const updatedCategoryData = {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: 2,
    slug: 'updated',
    restaurants: [],
    name: 'updated',
  };

  const restaurantData = {
    categoryName: 'russian food',
    name: 'Teremok',
    backgroundImage: '',
    address: '',
  };

  const updateRestaurantData = {
    name: 'Updated',
    id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    restaurantService = module.get<RestaurantService>(RestaurantService);
    restaurantRepository = module.get(getRepositoryToken(RestaurantEntity));
    categoryRepository = module.get(getRepositoryToken(CategoryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(restaurantService).toBeDefined();
  });

  describe('createRestaurant', () => {
    it('should create the restaurant', async () => {
      restaurantService.getCategory = jest.fn().mockResolvedValue(categoryData);

      restaurantRepository.create.mockResolvedValue(restaurantData);

      const result = await restaurantService.createRestaurant(
        userData,
        restaurantData,
      );

      expect(restaurantRepository.create).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.create).toHaveBeenCalledWith(restaurantData);
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurantData,
        category: categoryData,
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('updateRestaurant', () => {
    it('should return an error if the restaurant does not exist', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      const result = await restaurantService.updateRestaurant(
        userData,
        updateRestaurantData,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it("should return error if user haven't permission", async () => {
      restaurantRepository.findOne.mockResolvedValue({
        ...restaurantData,
        ownerId: 2,
      });

      const result = await restaurantService.updateRestaurant(
        userData,
        updateRestaurantData,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      });
    });

    it('should update the restaurant without update the category', async () => {
      restaurantRepository.findOne.mockResolvedValue({
        ...restaurantData,
        ownerId: 1,
      });

      const result = await restaurantService.updateRestaurant(
        userData,
        updateRestaurantData,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        updateRestaurantData,
      );
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });

    it('should update the restaurant with update the category', async () => {
      restaurantRepository.findOne.mockResolvedValue({
        ...restaurantData,
        ownerId: 1,
      });

      restaurantService.getCategory = jest
        .fn()
        .mockResolvedValue(updatedCategoryData);

      const result = await restaurantService.updateRestaurant(userData, {
        ...updateRestaurantData,
        categoryName: 'updated',
      });

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(restaurantService.getCategory).toHaveBeenCalledTimes(1);
      expect(restaurantService.getCategory).toHaveBeenCalledWith(
        updatedCategoryData.name,
      );
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...updateRestaurantData,
        categoryName: updatedCategoryData.name,
        category: updatedCategoryData,
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('deleteRestaurant', () => {
    it('should return an error if the restaurant does not exist', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      const result = await restaurantService.deleteRestaurant(
        userData,
        updateRestaurantData.id,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it("should return an error if the user hasn't permission", async () => {
      restaurantRepository.findOne.mockResolvedValue({
        ...restaurantData,
        ownerId: 2,
      });

      const result = await restaurantService.deleteRestaurant(
        userData,
        updateRestaurantData.id,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      });
    });

    it('should delete the restaurant', async () => {
      restaurantRepository.findOne.mockResolvedValue({
        ...restaurantData,
        ownerId: 1,
      });

      const result = await restaurantService.deleteRestaurant(
        userData,
        updateRestaurantData.id,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(restaurantRepository.delete).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.delete).toHaveBeenCalledWith(
        updateRestaurantData.id,
      );
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('getRestaurants', () => {
    it('should return restaurants and the total number of pages', async () => {
      const restaurants = [
        { ...restaurantData, id: 1 },
        { ...restaurantData, id: 2 },
      ];

      restaurantRepository.findAndCount.mockResolvedValue([
        restaurants,
        restaurants.length,
      ]);

      const page = 1;

      const result = await restaurantService.getRestaurants(page);

      expect(restaurantRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findAndCount).toHaveBeenCalledWith({
        take: ENTITIES_PER_PAGE,
        skip: 0,
      });
      expect(result).toMatchObject({
        isSuccess: true,
        restaurants,
        totalPages: 1,
      });
    });
  });

  describe('getRestaurantById', () => {
    it('should return an error if the restaurant does not exist', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      const restaurantId = 3;

      const result = await restaurantService.getRestaurantById(restaurantId);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(restaurantId, {
        relations: ['dishes'],
      });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it('should return the restaurant', async () => {
      restaurantRepository.findOne.mockResolvedValue(restaurantData);

      const restaurantId = 1;

      const result = await restaurantService.getRestaurantById(restaurantId);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(restaurantId, {
        relations: ['dishes'],
      });
      expect(result).toMatchObject({
        isSuccess: true,
        restaurant: restaurantData,
      });
    });
  });

  describe('getRestaurantsBySearch', () => {
    it('should return restaurants if the query is empty', async () => {
      restaurantService.getRestaurants = jest.fn().mockResolvedValue({
        isSuccess: true,
        restaurants: [],
      });

      const page = 1;

      const result = await restaurantService.getRestaurantsBySearch(
        page,
        undefined,
      );

      expect(restaurantService.getRestaurants).toHaveBeenCalledTimes(1);
      expect(restaurantService.getRestaurants).toHaveBeenCalledWith(page);
      expect(result).toMatchObject({
        isSuccess: true,
        restaurants: [],
      });
    });

    it('should return restaurants and the total number of pages', async () => {
      restaurantRepository.findAndCount.mockResolvedValue([
        {
          ...restaurantData,
          id: 1,
        },
        1,
      ]);

      const page = 1;

      const result = await restaurantService.getRestaurantsBySearch(page, 'u');

      expect(restaurantRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findAndCount).toHaveBeenCalledWith({
        take: ENTITIES_PER_PAGE,
        skip: 0,
        where: {
          name: ILike('%u%'),
        },
      });
      expect(result).toMatchObject({
        isSuccess: true,
        restaurants: {
          ...restaurantData,
          id: 1,
        },
        totalPages: 1,
      });
    });
  });

  describe('getCategory', () => {
    it('should create the category if it does not exist', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue(categoryData);

      const result = await restaurantService.getCategory('Test Category');

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        slug: categoryData.slug,
      });
      expect(categoryRepository.create).toHaveBeenCalledTimes(1);
      expect(categoryRepository.create).toHaveBeenCalledWith({
        slug: categoryData.slug,
        name: categoryData.name,
      });
      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith(categoryData);
      expect(result).toMatchObject(categoryData);
    });

    it('should return the category if it exist', async () => {
      categoryRepository.findOne.mockResolvedValue(categoryData);

      const result = await restaurantService.getCategory('Test Category');

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        slug: categoryData.slug,
      });
      expect(categoryRepository.create).toHaveBeenCalledTimes(0);
      expect(categoryRepository.save).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject(categoryData);
    });
  });
});
