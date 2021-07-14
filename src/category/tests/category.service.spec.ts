import { MockRepository } from '@app/common/types/mockRepository.type';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from '@app/category/category.service';
import { Errors } from '@app/common/constants/errors';
import { ENTITIES_PER_PAGE } from '@app/common/constants/entitiesPerPage';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let restaurantRepository: MockRepository<RestaurantEntity>;
  let categoryRepository: MockRepository<CategoryEntity>;

  const categories: CategoryEntity[] = [
    {
      name: 'category',
      id: 1,
      slug: 'category',
      restaurants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const restaurants = [
    {
      id: 1,
      name: 'test',
    },
    {
      id: 2,
      name: 'test2',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
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

    categoryService = module.get<CategoryService>(CategoryService);
    restaurantRepository = module.get(getRepositoryToken(RestaurantEntity));
    categoryRepository = module.get(getRepositoryToken(CategoryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('getAllCategories', () => {
    it('shoud return all categories', async () => {
      categoryRepository.find.mockResolvedValue(categories);

      const result = await categoryService.getAllCategories();

      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        isSuccess: true,
        categories,
      });
    });
  });

  describe('countRestaurants', () => {
    it('should return a count of restaurants', async () => {
      const countOfRestaurants = 3;

      categoryRepository.count.mockResolvedValue(countOfRestaurants);

      const result = await categoryService.countRestaurants(categories[0]);

      expect(categoryRepository.count).toHaveBeenCalledTimes(1);
      expect(categoryRepository.count).toHaveBeenCalledWith({
        category: categories[0],
      });
      expect(result).toEqual(countOfRestaurants);
    });
  });

  describe('getOneCategory', () => {
    it('should return an error if category does not exist', async () => {
      const page = 1;
      const slug = 'ccc';

      categoryRepository.findOne.mockResolvedValue(null);

      const result = await categoryService.getOneCategory(slug, page);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ slug });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it('should return the category and the total number of pages', async () => {
      const page = 1;
      const slug = 'ccc';
      const countOfRestaurants = 2;

      categoryRepository.findOne.mockResolvedValue(categories[0]);
      categoryService.countRestaurants = jest
        .fn()
        .mockResolvedValue(countOfRestaurants);
      restaurantRepository.find.mockResolvedValue(restaurants);

      const result = await categoryService.getOneCategory(slug, page);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ slug });
      expect(categoryService.countRestaurants).toHaveBeenCalledTimes(1);
      expect(categoryService.countRestaurants).toHaveBeenCalledWith(
        categories[0],
      );
      expect(restaurantRepository.find).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.find).toHaveBeenCalledWith({
        where: {
          category: categories[0],
        },
        take: ENTITIES_PER_PAGE,
        skip: 0,
      });
      expect(result).toMatchObject({
        isSuccess: true,
        category: {
          ...categories[0],
          restaurants,
        },
        totalPages: 1,
      });
    });
  });
});
