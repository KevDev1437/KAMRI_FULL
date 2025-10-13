import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface FakeStoreUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    geolocation: {
      lat: string;
      long: string;
    };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  phone: string;
}

@Injectable()
export class FakeStoreUsersService {
  private readonly API_URL = 'https://fakestoreapi.com';

  constructor(private readonly httpService: HttpService) {}

  async testConnection(): Promise<boolean> {
    try {
      const { status } = await firstValueFrom(this.httpService.get(`${this.API_URL}/users?limit=1`));
      return status === 200;
      } catch (error) {
        console.error('Fake Store Users API connection test failed:', (error as Error).message);
        return false;
      }
  }

  async getAllUsers(): Promise<FakeStoreUser[]> {
    const { data } = await firstValueFrom(this.httpService.get<FakeStoreUser[]>(`${this.API_URL}/users`));
    return data;
  }

  async getUserById(id: number): Promise<FakeStoreUser> {
    const { data } = await firstValueFrom(this.httpService.get<FakeStoreUser>(`${this.API_URL}/users/${id}`));
    return data;
  }

  async getUsersCount(): Promise<number> {
    const users = await this.getAllUsers();
    return users.length;
  }
}
