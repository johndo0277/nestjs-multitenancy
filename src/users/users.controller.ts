import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post()
    async createUser(@Body() request: { email: string, password: string }) {
        return this.userService.createUser(request);
    }

    @Get()
    async getUsers() {
        return this.userService.getUsers();
    }

}
