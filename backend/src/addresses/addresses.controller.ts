import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Post()
    create(@CurrentUser('userId') userId: string, @Body() createAddressDto: CreateAddressDto) {
        return this.addressesService.create(userId, createAddressDto);
    }

    @Get()
    findAll(@CurrentUser('userId') userId: string) {
        return this.addressesService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.findOne(id, userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() updateAddressDto: UpdateAddressDto,
    ) {
        return this.addressesService.update(id, userId, updateAddressDto);
    }

    @Patch(':id/default')
    setDefault(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.setDefault(id, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.addressesService.remove(id, userId);
    }
}
