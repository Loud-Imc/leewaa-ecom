import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    create(@CurrentUser('userId') userId: string | null, @Body() createAddressDto: CreateAddressDto) {
        return this.addressesService.create(userId, createAddressDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@CurrentUser('userId') userId: string) {
        return this.addressesService.findAll(userId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.findOne(id, userId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() updateAddressDto: UpdateAddressDto,
    ) {
        return this.addressesService.update(id, userId, updateAddressDto);
    }

    @Patch(':id/default')
    @UseGuards(JwtAuthGuard)
    setDefault(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.setDefault(id, userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.remove(id, userId);
    }
}
