import { ResponseFields } from "./fields/response.js";
/**
 * Base: /api/v1
 * End Point
 * query: ?token
 *  
 * 1. login: post /login
 * 2. signup: post /signup -> role: nếu là admin thì không cần supper duyệt
 * 
 * 3. users: get /users
 * 4. userById: get /users/:id
 * 5. update/delete userById: post /users
 * 
 * 6. kiots: get /kiots
 * 7. kiotById: get /kiots/:id
 * 8. update/delete kiotById: post /kiots
 * 
 * 9. customers: get /customers
 * 10. customerById: get /customers/:id
 * 11. update/delete customerById: post /customers
 * 
 * 12. transactions : get /transactions
 * 13. transactionById: get /transactions/:id
 * 14. update/delete transactionById: post /transactions
 *
 * 15. products : get /products
 * 16. productnById: get /products/:id
 * 17. update/delete productById: post /products
 * 
 * 18. create user : post /users/create
 * 19. create kiot: post /kiots/create
 * 20. create customers: post /customers/create
 * 21. create transactions: post /transactions/create
 * 22. create products: post /products/create
 * 
 * 23. reports : get /reports/:id
 */

const users = '/users';
const kiots = '/kiots';
const customers = '/customers';
const transactions = '/transactions';
const products = '/products';
const reports = '/reports/:id-kiot';

const API = {
    base: '/api/v1',
    login: '/login',
    signup: '/sign-up',

    users: `${users}`,
    user_id: `${users}/:id`,
    user_update: `${users}`,
    user_delete: `${users}`,
    user_create: `${users}/create`,

    kiots: `${kiots}`,
    kiot_Id: `${kiots}/:id`,
    kiot_update: `${kiots}`,
    kiot_delete: `${kiots}`,
    kiot_create: `${kiots}/create`,

    customers: `${customers}`,
    customer_Id: `${customers}/:id`,
    customer_update: `${customers}`,
    customer_delete: `${customers}`,
    customer_create: `${customers}/create`,

    transactions: `${transactions}`,
    transaction_Id: `${transactions}/:id`,
    transaction_update: `${transactions}`,
    transaction_delete: `${transactions}`,
    transaction_create: `${transactions}/create`,

    products: `${products}`,
    product_Id: `${products}/:id`,
    product_update: `${products}`,
    product_delete: `${products}`,
    product_create: `${products}/create`,

    reports: `${reports}`,
    report_Id: `${reports}:id`,
    report_update: `${reports}`,
    report_delete: `${reports}`,
    report_create: `${reports}/create`,
}

const METHOD = {
    login: 'POST',
    signup: 'POST',

    users: 'GET',
    user_id: 'GET',
    user_update: 'POST',
    user_delete: 'POST',
    user_create: 'POST',

    kiots: 'GET',
    kiot_Id: 'GET',
    kiot_update: 'POST',
    kiot_delete: 'POST',
    kiot_create: 'POST',

    customers: 'GET',
    customer_Id: 'GET',
    customer_update: 'POST',
    customer_delete: 'POST',
    customer_create: 'POST',

    transactions: 'GET',
    transaction_Id: 'GET',
    transaction_update: 'POST',
    transaction_delete: 'POST',
    transaction_create: 'POST',

    products: 'GET',
    product_Id: 'GET',
    product_update: 'POST',
    product_delete: 'POST',
    product_create: 'POST',

    reports: 'GET',
    report_Id: 'GET',
    report_update: 'POST',
    report_delete: 'POST',
    report_create: 'POST',
}

const AUTH = {
    access_token: 'access-token',
    email: 'email',
    password: 'password',
    pa: 'pa'
}

const RESPONSE = (data, message, ex, error) => {

    const result = {};
    if (data) result[ResponseFields.data] = data;
    if (message) result[ResponseFields.message] = message;
    if (ex) result[ResponseFields.catch] = ex;
    if (error) result[ResponseFields.error] = error;

    return result;
};

export { API, AUTH, RESPONSE }