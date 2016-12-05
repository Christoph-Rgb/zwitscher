const UsersApi = require('./app/api/usersapi');

module.exports = [
//   { method: 'GET', path: '/api/candidates', config: CandidatesApi.find },
//   { method: 'GET', path: '/api/candidates/{id}', config: CandidatesApi.findOne },
//   { method: 'POST', path: '/api/candidates', config: CandidatesApi.create },
//   { method: 'DELETE', path: '/api/candidates/{id}', config: CandidatesApi.deleteOne },
//   { method: 'DELETE', path: '/api/candidates', config: CandidatesApi.deleteAll },
//
  { method: 'GET', path: '/api/users', config: UsersApi.find },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },
  { method: 'DELETE', path: '/api/users', config: UsersApi.deleteAll },
//
//   { method: 'GET', path: '/api/donations', config: DonationsApi.findAllDonations },
//   { method: 'GET', path: '/api/candidates/{id}/donations', config: DonationsApi.findDonations },
//   { method: 'POST', path: '/api/candidates/{id}/donations', config: DonationsApi.makeDonation },
//   { method: 'DELETE', path: '/api/donations', config: DonationsApi.deleteAllDonations },
//   { method: 'DELETE', path: '/api/candidates/{id}/donations',
//             config: DonationsApi.deleteDonationsForCandidate, },
//
   { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticate },
];
