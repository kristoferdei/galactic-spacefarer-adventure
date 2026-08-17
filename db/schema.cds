namespace galactic.spacefarer;

using { cuid, managed } from '@sap/cds/common';

entity Spacefarers : cuid, managed {
  name                : String(100) not null;
  stardustCollection  : Integer default 0;
  wormholeSkill       : String(20) enum { novice; adept; master } default 'novice';
  originPlanet        : String(50);
  spacesuitColor      : String(20);
  department          : Association to Departments;
  position            : Association to Positions;
}

entity Departments : cuid {
  name     : String(100) not null;
  planet   : String(50);
  members  : Association to many Spacefarers on members.department = $self;
}

entity Positions : cuid {
  title    : String(100) not null;
  members  : Association to many Spacefarers on members.position = $self;
}
