import { Controller, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AdminService } from '../admin.service';
import { Types } from 'mongoose';
import { Encrypt } from '../../../utils/encrypt';

@Controller('system')
export class SystemController {
  constructor(
    private readonly adminService: AdminService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/info')
  async getUserInfo(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.adminService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: 100001, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);
    let permission: string[] = [];
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    if (!!isSuper) {
      permission = await this.adminService.findAdminPermission().then(rs => {
        return rs.map(val => val.name);
      });
    } else {
      let pd: any[] = user.permissionDetail;
      for (let j = 0; j < pd.length; ++j) {
        if (permission.indexOf(pd[j].name) === -1)
          permission = [...permission, pd[j].name];
      }
    }
    return {
      uid: user._id.toString(),
      account: user.account,
      access: permission
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/list')
  async getUserList(@Req() req): Promise<any> {
    return this.adminService.findAdminUser();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/create')
  async createUser(@Req() req): Promise<any> {
    const { account, password, roleIds, description } = req.body;
    const user = await this.adminService
      .findAdminUserOne({
        account
      });
    if (user) throw new HttpException({
      errCode: 10001, message: '该账号已存在'
    }, HttpStatus.OK);
    return await this.adminService
      .createAdminUser([{
        account,
        password: Encrypt.md5(password).toLocaleUpperCase(),
        description
      }]).then(async rs => {
        let arr = roleIds.map(val => {
          return { user: rs[0]._id, role: new Types.ObjectId(val) };
        });
        arr.length !== 0 && await this.adminService.createAdminUserRole(arr);
        return { message: 'ok' };
      })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/update')
  async updateUser(@Req() req): Promise<any> {
    const { id, password, roleIds, status, description } = req.body;
    const user = await this.adminService.findAdminUserOne({
      _id: new Types.ObjectId(id)
    });
    if (!user) throw new HttpException({
      errCode: 10001, message: '该用户不存在'
    }, HttpStatus.OK);
    let params: any = {};
    if (!isNaN(status) && user.status !== status)
      params.status = status;
    if (!!description) params.description = description;
    if (!!password && user.password !== Encrypt.md5(password))
      params.password = Encrypt.md5(password);
    let addArr = roleIds.filter(val => {
      return user.roleIds.indexOf(val) === -1;
    }).map(val => {
      return { user: user._id, role: new Types.ObjectId(val) };
    });
    let delArr = user.roleIds.filter(val => {
      return roleIds.indexOf(val) === -1;
    });
    await this.adminService.updateAdminUserOne(params, {
      _id: user._id
    });
    addArr.length !== 0 && await this.adminService.createAdminUserRole(addArr);
    delArr.length !== 0 && await this.adminService.deleteAdminUserRole(
      user._id.toString(), delArr
    );
    return { message: '更新用户成功' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/delete')
  async deleteUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.adminService.deleteAdminUser(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('menu/list')
  async getMenuList(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.adminService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: 100001, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    return isSuper ? await this.adminService.findAdminMenu() : user.menuDetail;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('menu/create')
  async createMenu(@Req() req): Promise<any> {
    const menu = req.body;
    if (!!menu.parent)
      menu.parent = new Types.ObjectId(menu.parent);
    return await this.adminService.createMenu(menu).then(rs => {
      return rs[0];
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('menu/update')
  async updateMenu(@Req() req): Promise<any> {
    const menu = req.body;
    if (!!menu.parent)
      menu.parent = new Types.ObjectId(menu.parent);
    return await this.adminService.updateMenu(menu).then(rs => {
      console.log("rs: ", rs);
      return [];
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('menu/delete')
  async deleteMenu(@Req() req): Promise<any> {
    console.log(req.body);
    const { id } = req.body;
    return await this.adminService.deleteMenu(id).then(rs => {
      return [];
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('menu/delete/multiple')
  async deleteMenuMultiple(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.adminService.deleteMenuMultiple(ids).then(rs => {
      return [];
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/permission/list')
  async getPermissionList(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.adminService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: 100001, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    return isSuper ? await this.adminService.findAdminPermission() : user.permissionDetail;
    // return await this.adminService.findAdminPermission().then(rs => {
    //   console.log("rs: ", rs);
    //   return rs;
    // })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/permission/create')
  async createPermission(@Req() req): Promise<any> {
    const { name, title, parent } = req.body;
    return await this.adminService.createAdminPermission([{
      name, title, parent: new Types.ObjectId(parent)
    }]).then(rs => {
      return rs;
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/permission/update')
  async updatePermission(@Req() req): Promise<any> {
    return await this.adminService.updateAdminPermission(req.body).then(rs => {
      return rs;
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/permission/delete')
  async deletePermission(@Req() req): Promise<any> {
    const { id } = req.body;
    return await this.adminService.deleteAdminPermission(id).then(rs => {
      return rs;
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/list')
  async getRoleList(@Req() req): Promise<any> {
    return await this.adminService.findAdminRole();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/create')
  async createRole(@Req() req): Promise<any> {
    return await this.adminService.createAdminRole([req.body]);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/update')
  async updateRole(@Req() req): Promise<any> {
    let { id, name, desc } = req.body;
    return await this.adminService.updateAdminRole({
      name, desc
    }, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/update/permission')
  async updateRolePermission(@Req() req): Promise<any> {
    let { id, menuIds, permissionIds } = req.body;
    const roles = await this.adminService.findAdminRoleById(id) || [];
    const role = roles.length === 1 ? roles[0] : null;
    if (role === null) return ;
    const addRoleMenu =  menuIds.filter(val =>
      role.inventoryMenu.findIndex(
        item => item.menu.toString() === val
      ) === -1
    );
    const delRoleMenu =  role.inventoryMenu.filter(val =>
      menuIds.findIndex(
        item => item === val.menu.toString()
      ) === -1
    ).map( val => val.menu);
    const addRolePermission = permissionIds.filter(val =>
      role.inventoryPermission.findIndex(
        item => item.permission.toString() === val
      ) === -1
    );
    const delRolePermission = role.inventoryPermission.filter(val =>
      permissionIds.findIndex(
        item => item === val.permission.toString()
      ) === -1
    ).map( val => val.permission);
    console.log(addRoleMenu, delRoleMenu, addRolePermission, delRolePermission);
    await this.adminService.createAdminRoleMenu(addRoleMenu.map( val => {
      return { role: new Types.ObjectId(id),  menu: new Types.ObjectId(val) }
    }));
    await this.adminService.deleteAdminRoleMenu(id, delRoleMenu);

    await this.adminService.createAdminRolePermission(addRolePermission.map( val => {
      return { role: new Types.ObjectId(id),  permission: new Types.ObjectId(val) }
    }));
    await this.adminService.deleteAdminRolePermission(id, delRolePermission);
    return { message: "ok" };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/delete')
  async deleteRole(@Req() req): Promise<any> {
    const { id } = req.body;
    return await this.adminService.deleteAdminRole({
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('role/delete/multiple')
  async deleteRoleMultiple(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.adminService.deleteAdminRoleMultiple(ids)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           ;
  }
}
