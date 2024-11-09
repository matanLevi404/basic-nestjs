import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TokenDto } from 'src/dtos/token.dto';
import { UserDto } from 'src/dtos/user.dto';
import { UserService } from 'src/services/user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('authenticate')
  @ApiOkResponse({ type: TokenDto })
  login(@Body() userDto: UserDto): Promise<TokenDto> {
    return this.userService.login(userDto);
  }

  @Post()
  @ApiOkResponse({ type: UserDto })
  insertUser(@Body() userDto: UserDto): Promise<UserDto> {
    return this.userService.insertUser(userDto);
  }
}
