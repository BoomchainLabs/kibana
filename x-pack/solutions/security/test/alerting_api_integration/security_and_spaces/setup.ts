/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isCustomRoleSpecification } from '@kbn/test-suites-xpack-platform/alerting_api_integration/common/types';
import type { FtrProviderContext } from '../ftr_provider_context';
import { Spaces, Users } from './scenarios';

export async function setupSpacesAndUsers(getService: FtrProviderContext['getService']) {
  const securityService = getService('security');
  const spacesService = getService('spaces');

  for (const space of Spaces) {
    await spacesService.create(space);
  }

  for (const user of Users) {
    const roles = [...(user.role ? [user.role] : []), ...(user.roles ? user.roles : [])];

    await securityService.user.create(user.username, {
      password: user.password,
      full_name: user.fullName,
      roles: roles.map((role) => role.name),
    });

    for (const role of roles) {
      if (isCustomRoleSpecification(role)) {
        await securityService.role.create(role.name, {
          kibana: role.kibana,
          elasticsearch: role.elasticsearch,
        });
      }
    }
  }
}

export async function tearDown(getService: FtrProviderContext['getService']) {
  const securityService = getService('security');
  const spacesService = getService('spaces');

  for (const user of Users) {
    await securityService.user.delete(user.username);

    const roles = [...(user.role ? [user.role] : []), ...(user.roles ? user.roles : [])];
    for (const role of roles) {
      if (isCustomRoleSpecification(role)) {
        await securityService.role.delete(role.name);
      }
    }
  }

  for (const space of Spaces) {
    await spacesService.delete(space.id);
  }
}
