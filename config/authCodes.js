const authCodes = {
  admin: {
    create: "CAD1",
    read: "RAD1",
    update: "UAD1",
    delete: "DAD1",
  },
  album: {
    create: "CAL1",
    read: "RAL1",
    update: "UAL1",
    delete: "DAL1",
    manageAlbumPhotos: "XAL1" // Non-standard code
  },
  auth: {
    create: "CAU1",
    read: "RAU1",
    update: "UAU1",
    delete: "DAU1",
  },
  church: {
    create: "CCH1",
    read: "RCH1",
    update: "UCH1",
    delete: "DCH1",
  },
  company: {
    create: "CCO1",
    read: "RCO1",
    update: "UCO1",
    delete: "DCO1",
  },
  event: {
    create: "CE1",
    read: "RE1",
    update: "UE1",
    delete: "DE1",
  },
  eventRegistration: {
    create: "CER1",
    read: "RER1",
    update: "UER1",
    delete: "DER1",
  },
  permission: {
    create: "CPE1",
    read: "RPE1",
    update: "UPE1",
    delete: "DPE1",
  },
  photo: {
    create: "CPH1",
    read: "RPH1",
    update: "UPH1",
    delete: "DPH1",
  },
  role: {
    create: "CR1",
    read: "RR1",
    update: "UR1",
    delete: "DR1",
  },
  rolePermission: {
    create: "CRP1",
    read: "RRP1",
    update: "URP1",
    delete: "DRP1",
    manageRolePermissions: "XRP1" // Non-standard code
  },
  team: {
    create: "CT1",
    read: "RT1",
    update: "UT1",
    delete: "DT1",
  },
  user: {
    create: "CU1",
    read: "RU1",
    update: "UU1",
    delete: "DU1",
    readOne: "RU1_ONE",
  },
};

module.exports = authCodes;