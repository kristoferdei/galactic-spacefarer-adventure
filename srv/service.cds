using galactic.spacefarer as sf from '../db/schema';

@requires: 'authenticated-user'
service SpacefarerService {

  @restrict: [
    { grant: 'READ',                          to: 'authenticated-user' },
    { grant: ['CREATE', 'UPDATE', 'DELETE'],  to: 'admin' }
  ]
  entity Spacefarers as projection on sf.Spacefarers;

  @readonly
  entity Departments as projection on sf.Departments;

  @readonly
  entity Positions as projection on sf.Positions;
}
