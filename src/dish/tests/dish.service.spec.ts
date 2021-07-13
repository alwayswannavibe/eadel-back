import { MockRepository } from '@app/common/types/mockRepository.type';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DishService } from '@app/dish/dish.service';
import { DishEntity } from '@app/dish/entities/dish.entity';
import { CreateDishDto } from '@app/dish/dtos/createDish.dto';
import { UserRole } from '@app/user/types/userRole.type';
import { Errors } from '@app/common/constants/errors';
import { UpdateDishDto } from '@app/dish/dtos/updateDish.dto';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('DishService', () => {
  let dishService: DishService;
  let restaurantRepository: MockRepository<RestaurantEntity>;
  let dishRepository: MockRepository<DishEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DishEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    dishService = module.get<DishService>(DishService);
    restaurantRepository = module.get(getRepositoryToken(RestaurantEntity));
    dishRepository = module.get(getRepositoryToken(DishEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dishService).toBeDefined();
  });

  describe('createDish', () => {
    const createDishDto: CreateDishDto = {
      restaurantId: 1,
      price: 100,
      name: 'fsdfdfsdfsd',
      description: 'dasdasdsa ssdfgdfs dvdfsgefgf',
    };

    const user = {
      id: 1,
      email: '',
      password: '',
      role: UserRole.Owner,
      restaurants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return an error if the restaurant does not found', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      const result = await dishService.createDish(createDishDto, user);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        createDishDto.restaurantId,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it('should return an error if the user has not permission', async () => {
      const restaurant = {
        ownerId: 2,
      };

      restaurantRepository.findOne.mockResolvedValue(restaurant);

      const result = await dishService.createDish(createDishDto, user);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        createDishDto.restaurantId,
      );
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      });
    });

    it('should create the restaurant', async () => {
      const restaurant = {
        ownerId: user.id,
      };

      restaurantRepository.findOne.mockResolvedValue(restaurant);
      restaurantRepository.create.mockResolvedValue({
        ...createDishDto,
        restaurant,
      });

      const result = await dishService.createDish(createDishDto, user);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        createDishDto.restaurantId,
      );
      expect(restaurantRepository.create).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.create).toHaveBeenCalledWith({
        ...createDishDto,
        restaurant,
      });
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...createDishDto,
        restaurant,
      });
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('updateDish', () => {
    const updateDishDto: UpdateDishDto = {
      id: 1,
      price: 120,
    };

    const user = {
      id: 1,
      email: '',
      password: '',
      role: UserRole.Owner,
      restaurants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return an error if the dish does not found', async () => {
      dishRepository.findOne.mockResolvedValue(null);

      const result = await dishService.updateDish(updateDishDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(updateDishDto.id, {
        relations: ['restaurant'],
      });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it('should return an error if the user has not permission', async () => {
      const restaurant = {
        ownerId: 2,
      };

      dishRepository.findOne.mockResolvedValue({ restaurant });

      const result = await dishService.updateDish(updateDishDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(updateDishDto.id, {
        relations: ['restaurant'],
      });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      });
    });

    it('should update the restaurant', async () => {
      const restaurant = {
        ownerId: 1,
      };

      dishRepository.findOne.mockResolvedValue({ restaurant });

      const result = await dishService.updateDish(updateDishDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(updateDishDto.id, {
        relations: ['restaurant'],
      });
      expect(dishRepository.save).toHaveBeenCalledTimes(1);
      expect(dishRepository.save).toHaveBeenCalledWith(updateDishDto);
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });

  describe('deleteDish', () => {
    const idDto = {
      id: 1,
    };

    const user = {
      id: 1,
      email: '',
      password: '',
      role: UserRole.Owner,
      restaurants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return an error if the dish does not found', async () => {
      dishRepository.findOne.mockResolvedValue(null);

      const result = await dishService.deleteDish(idDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(idDto.id, {
        relations: ['restaurant'],
      });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.NOT_FOUND,
      });
    });

    it('should return an error if the user has not permission', async () => {
      const restaurant = {
        ownerId: 2,
      };

      dishRepository.findOne.mockResolvedValue({ restaurant });

      const result = await dishService.deleteDish(idDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(idDto.id, {
        relations: ['restaurant'],
      });
      expect(result).toMatchObject({
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      });
    });

    it('should delete the restaurant', async () => {
      const restaurant = {
        ownerId: 1,
      };

      dishRepository.findOne.mockResolvedValue({ restaurant, id: idDto.id });

      const result = await dishService.deleteDish(idDto, user);

      expect(dishRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishRepository.findOne).toHaveBeenCalledWith(idDto.id, {
        relations: ['restaurant'],
      });
      expect(dishRepository.delete).toHaveBeenCalledTimes(1);
      expect(dishRepository.delete).toHaveBeenCalledWith(idDto.id);
      expect(result).toMatchObject({
        isSuccess: true,
      });
    });
  });
});
