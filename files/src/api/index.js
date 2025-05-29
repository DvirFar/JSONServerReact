import * as auth from './auth';
import * as todos from './todos';
import * as posts from './posts';
import * as albums from './albums';
import * as photos from './photos';
import { apiRequest } from './config';

// Export all API utilities
export default {
  auth,
  todos,
  posts,
  albums,
  photos,
  apiRequest,
};