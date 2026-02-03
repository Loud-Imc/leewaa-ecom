export enum Permission {
    // Products
    PRODUCTS_VIEW = 'products:view',
    PRODUCTS_CREATE = 'products:create',
    PRODUCTS_EDIT = 'products:edit',
    PRODUCTS_DELETE = 'products:delete',

    // Categories
    CATEGORIES_VIEW = 'categories:view',
    CATEGORIES_CREATE = 'categories:create',
    CATEGORIES_EDIT = 'categories:edit',
    CATEGORIES_DELETE = 'categories:delete',

    // Orders
    ORDERS_VIEW = 'orders:view',
    ORDERS_EDIT = 'orders:edit',
    ORDERS_DELETE = 'orders:delete',
    ORDERS_UPDATE_STATUS = 'orders:update_status',
    ORDERS_PRINT = 'orders:print',

    // Users
    USERS_VIEW = 'users:view',
    USERS_CREATE = 'users:create',
    USERS_EDIT = 'users:edit',
    USERS_DELETE = 'users:delete',
    USERS_MANAGE_ROLES = 'users:manage_roles',

    // Coupons
    COUPONS_VIEW = 'coupons:view',
    COUPONS_CREATE = 'coupons:create',
    COUPONS_EDIT = 'coupons:edit',
    COUPONS_DELETE = 'coupons:delete',

    // Banners
    BANNERS_VIEW = 'banners:view',
    BANNERS_CREATE = 'banners:create',
    BANNERS_EDIT = 'banners:edit',
    BANNERS_DELETE = 'banners:delete',

    // Reports
    REPORTS_VIEW = 'reports:view',

    // Roles
    ROLES_VIEW = 'roles:view',
    ROLES_CREATE = 'roles:create',
    ROLES_EDIT = 'roles:edit',
    ROLES_DELETE = 'roles:delete',
}

export const PERMISSION_GROUPS = [
    {
        name: 'Products',
        permissions: [
            { key: Permission.PRODUCTS_VIEW, label: 'View Products' },
            { key: Permission.PRODUCTS_CREATE, label: 'Create Products' },
            { key: Permission.PRODUCTS_EDIT, label: 'Edit Products' },
            { key: Permission.PRODUCTS_DELETE, label: 'Delete Products' },
        ],
    },
    {
        name: 'Categories',
        permissions: [
            { key: Permission.CATEGORIES_VIEW, label: 'View Categories' },
            { key: Permission.CATEGORIES_CREATE, label: 'Create Categories' },
            { key: Permission.CATEGORIES_EDIT, label: 'Edit Categories' },
            { key: Permission.CATEGORIES_DELETE, label: 'Delete Categories' },
        ],
    },
    {
        name: 'Orders',
        permissions: [
            { key: Permission.ORDERS_VIEW, label: 'View Orders' },
            { key: Permission.ORDERS_EDIT, label: 'Edit Orders' },
            { key: Permission.ORDERS_UPDATE_STATUS, label: 'Update Order Status' },
            { key: Permission.ORDERS_PRINT, label: 'Print Invoices' },
            { key: Permission.ORDERS_DELETE, label: 'Delete Orders' },
        ],
    },
    {
        name: 'Users',
        permissions: [
            { key: Permission.USERS_VIEW, label: 'View Users' },
            { key: Permission.USERS_CREATE, label: 'Create Admins/Staff' },
            { key: Permission.USERS_EDIT, label: 'Edit Users' },
            { key: Permission.USERS_DELETE, label: 'Delete Users' },
            { key: Permission.USERS_MANAGE_ROLES, label: 'Manage User Roles' },
        ],
    },
    {
        name: 'Coupons',
        permissions: [
            { key: Permission.COUPONS_VIEW, label: 'View Coupons' },
            { key: Permission.COUPONS_CREATE, label: 'Create Coupons' },
            { key: Permission.COUPONS_EDIT, label: 'Edit Coupons' },
            { key: Permission.COUPONS_DELETE, label: 'Delete Coupons' },
        ],
    },
    {
        name: 'Banners',
        permissions: [
            { key: Permission.BANNERS_VIEW, label: 'View Banners' },
            { key: Permission.BANNERS_CREATE, label: 'Create Banners' },
            { key: Permission.BANNERS_EDIT, label: 'Edit Banners' },
            { key: Permission.BANNERS_DELETE, label: 'Delete Banners' },
        ],
    },
    {
        name: 'Roles',
        permissions: [
            { key: Permission.ROLES_VIEW, label: 'View Roles' },
            { key: Permission.ROLES_CREATE, label: 'Create Roles' },
            { key: Permission.ROLES_EDIT, label: 'Edit Roles' },
            { key: Permission.ROLES_DELETE, label: 'Delete Roles' },
        ],
    },
    {
        name: 'Reports',
        permissions: [
            { key: Permission.REPORTS_VIEW, label: 'View Reports' },
        ],
    },
];
