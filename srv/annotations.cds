using SpacefarerService as service from './service';

annotate service.Spacefarers with @(
  UI.SelectionFields: [
    originPlanet,
    wormholeSkill
  ],

  UI.LineItem: [
    { Value: name },
    { Value: originPlanet },
    { Value: stardustCollection },
    { Value: spacesuitColor },
    { Value: wormholeSkill }
  ],

  UI.Facets: [
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Spacefarer Details',
      Target: '@UI.FieldGroup#Main'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Assignment',
      Target: '@UI.FieldGroup#Assignment'
    }
  ],

  UI.FieldGroup#Main: {
    Data: [
      { Value: name },
      { Value: originPlanet },
      { Value: spacesuitColor },
      { Value: stardustCollection },
      { Value: wormholeSkill }
    ]
  },

  UI.FieldGroup#Assignment: {
    Data: [
      { Value: department_ID, Label: 'Department' },
      { Value: position_ID,   Label: 'Position' }
    ]
  },

  UI.HeaderInfo: {
    TypeName      : 'Spacefarer',
    TypeNamePlural: 'Spacefarers',
    Title         : { Value: name },
    Description   : { Value: originPlanet }
  }
);

annotate service.Spacefarers with {
  stardustCollection @title: 'Stardust Collection';
  wormholeSkill       @title: 'Wormhole Navigation Skill';
  originPlanet        @title: 'Origin Planet';
  spacesuitColor       @title: 'Spacesuit Color';
};
