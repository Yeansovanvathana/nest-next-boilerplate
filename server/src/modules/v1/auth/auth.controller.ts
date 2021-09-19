import { ClassSerializerInterceptor, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RateLimit } from 'nestjs-rate-limiter'
import { AuthService } from './services/auth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('v1/auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {}
    
    @RateLimit({
        points: 1,
        duration: 120,
        errorMessage: 'You have reached the limit. You have to wait 2 minutes before trying again.'
    })
    @Post('local/register')
    async register() {
        return this.authService.register()
    }

    @RateLimit({
        points: 5,
        duration: 300,
        errorMessage: 'You have reached the limit of login requests. You have to wait 5 minutes before trying again.'
    })
    @Post('local/login')
    async login() {
        // return this.authService.login()
    }

    @ApiBearerAuth()
    @Post('logout')
    async logout() {
        return this.authService.logout()
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() _req: Request) {
        // Guard redirects
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        await this.authService.googleLogin(req)
        return await req.res.redirect('/api/v1/auth/me')
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return req.user
    }

}
