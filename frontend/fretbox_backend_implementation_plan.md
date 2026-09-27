# Fretbox Backend: Implementation Plan (MongoDB Edition)

Scope: server only. Stack: Node.js, Express, MongoDB (Mongoose), Socket.io, Redis (optional), `node-cron`, `web-push`, JWT auth.

---

## 1. Folder Structure

```
server/
├── package.json
├── .env
├── .env.example
├── .gitignore
└── src/
    ├── index.js
    ├── app.js
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── webpush.js
    ├── models/
    │   ├── User.js
    │   ├── Location.js
    │   ├── Ticket.js
    │   ├── GatePass.js
    │   ├── Notice.js
    │   ├── MessMenu.js
    │   └── Attendance.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── ticket.routes.js
    │   ├── gatePass.routes.js
    │   ├── notice.routes.js
    │   ├── mess.routes.js
    │   ├── attendance.routes.js
    │   └── push.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── ticket.controller.js
    │   ├── gatePass.controller.js
    │   ├── notice.controller.js
    │   ├── mess.controller.js
    │   ├── attendance.controller.js
    │   └── push.controller.js
    ├── services/
    │   ├── ticket.service.js
    │   ├── gatePass.service.js
    │   ├── notice.service.js
    │   ├── push.service.js
    │   ├── attendance.service.js
    │   └── cache.service.js
    ├── middleware/
    │   ├── auth.js
    │   ├── requireRole.js
    │   ├── validate.js
    │   ├── notFound.js
    │   └── errorHandler.js
    ├── validators/
    │   ├── auth.schema.js
    │   ├── ticket.schema.js
    │   ├── gatePass.schema.js
    │   └── notice.schema.js
    ├── sockets/
    │   └── index.js
    ├── jobs/
    │   ├── index.js
    │   ├── nightlyReport.job.js
    │   └── expirePasses.job.js
    ├── utils/
    │   ├── asyncHandler.js
    │   ├── ApiError.js
    │   ├── jwt.js
    │   ├── qrToken.js
    │   └── time.js
    └── scripts/
        ├── seed.js
        └── generateVapidKeys.js
```

---

## 2. Environment Variables

`.env.example`:

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=change-me
QR_TOKEN_SECRET=change-me-too
CLIENT_ORIGIN=http://localhost:5173
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com
TZ=Asia/Kolkata
```

`package.json` scripts:

```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "seed": "node src/scripts/seed.js",
  "vapid": "node src/scripts/generateVapidKeys.js"
}
```

Dependencies to install:

```bash
npm i express cors dotenv mongoose zod jsonwebtoken bcrypt socket.io web-push node-cron
npm i -D nodemon
```

---

## 3. Data Models (Mongoose)

### `User`
- `fullName`, `role` (`STUDENT`/`WARDEN`/`TECHNICIAN`/`SECURITY`/`ADMIN`), `phoneNumber` (unique), `passwordHash`
- Students: `locationId` (ref `Location`), `hostel`, `batch`
- Technicians: embedded `shifts: [{ category, startMinute, endMinute }]`
- All: embedded `pushSubscriptions: [{ endpoint, keys, createdAt }]`
- Indexes: `{ role, hostel, batch }`, `{ 'pushSubscriptions.endpoint' }`

### `Location`
- `buildingName`, `floor`, `roomNumber`
- Unique index on `{ buildingName, floor, roomNumber }`

### `Ticket`
- `clientRequestId` (unique, sparse — idempotency key)
- `creatorId`, `locationId`, `building` (denormalized), `category`, `description`
- `status` (`OPEN`/`ASSIGNED`/`IN_PROGRESS`/`RESOLVED`/`DUPLICATE`)
- `assignedTechId`, `parentTicketId`, `duplicateCount`, `statusHistory`, `resolvedAt`
- Indexes: `{ category, status, createdAt, building }`, `{ parentTicketId }`, `{ assignedTechId, status }`

### `GatePass`
- `clientRequestId` (unique, sparse), `studentId`, `hostel`, `reason`
- `requestedExitTime`, `expectedReturnTime`
- `status` (`PENDING`/`APPROVED`/`REJECTED`/`EXITED`/`RETURNED`/`EXPIRED`)
- `approvedBy`, `actualExitTime`, `actualReturnTime`
- Indexes: `{ status, hostel }`, `{ studentId, createdAt }`

### `Notice`
- `title`, `body`, `isEmergency`, `targetAudience: { hostel, batch }`, `createdBy`
- Index: `{ createdAt }`

### `MessMenu`
- `menuDate` (`"YYYY-MM-DD"`), `mealType`, `items: [String]`, `updatedBy`
- Unique index on `{ menuDate, mealType }`

### `Attendance`
- `studentId`, `attDate`, `status` (`PRESENT`/`ABSENT`/`ON_LEAVE`), `markedBy`
- Unique index on `{ studentId, attDate }`

---

## 4. API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | Any | Returns JWT with `userId`, `role` |
| GET | `/api/me` | Any | Current user profile |
| POST | `/api/push/subscribe` | Any | Add a push subscription |
| POST | `/api/tickets` | Student | Create ticket (idempotency, dedup, routing) |
| GET | `/api/tickets` | Any (filtered) | List tickets by role |
| PATCH | `/api/tickets/:id/status` | Technician, Warden | Update ticket progress |
| POST | `/api/gate-passes` | Student | Request a pass |
| PATCH | `/api/gate-passes/:id` | Warden | Approve or reject |
| GET | `/api/gate-passes/:id/qr` | Student | Get signed QR token |
| POST | `/api/gate-passes/scan` | Security | Exit or return scan |
| GET | `/api/gate-passes/overdue` | Warden | Unreturned students |
| POST | `/api/notices` | Warden, Admin | Create notice or emergency alert |
| GET | `/api/notices` | Any | Notices for this user |
| PUT | `/api/mess/:date/:meal` | Warden | Set menu (upsert) |
| GET | `/api/mess/today` | Any | Today's menu |
| GET, POST | `/api/attendance` | Warden | Roll call |

---

## 5. Core Service Logic

### `ticket.service.js`
1. Check `clientRequestId` for an existing ticket; return it if found.
2. Run the dedup lookup (building-level for `IT`/`ELECTRICAL`, room-level for `PLUMBING`/`CARPENTRY`) with `findOneAndUpdate` to atomically bump `duplicateCount` on a match.
3. If a match: create the ticket as `DUPLICATE`, linked via `parentTicketId`.
4. If no match: find an on-duty technician from `shifts` using IST minutes-since-midnight, pick the one with the fewest active tickets, save as `ASSIGNED`, emit `ticket:assigned` to `user:<techId>`.
5. If nobody is on duty: save as `OPEN`, emit `ticket:unassigned` to `role:WARDEN`.
6. On `PATCH .../status` to `RESOLVED`: bulk-update all children with `parentTicketId` to `RESOLVED`, notify each creator.

### `gatePass.service.js`
1. Create with idempotency check, status `PENDING`.
2. Approve/reject sets `approvedBy` and status; notify the student.
3. `GET .../qr` signs a short-lived token (`qrToken.js`) containing the pass id.
4. `POST /scan` verifies the token, then runs one atomic `findOneAndUpdate`: `APPROVED → EXITED` first; if that matches nothing, try `EXITED → RETURNED`. No match on either means an invalid or already-used pass.

### `notice.service.js`
1. Resolve recipients with a plain query on `hostel`/`batch` (omitted fields match everyone).
2. Emit to the relevant Socket.io room(s).
3. Call `push.service.js` to send Web Push, with high urgency when `isEmergency` is true.

### `push.service.js`
- Sends via `web-push`; on a 404/410 response, `$pull`s the dead subscription from the user document.

### `attendance.service.js`
- Pre-fills the roll call: students with a gate pass in `EXITED` status default to `ON_LEAVE`; everyone else defaults to `PRESENT`. Warden submits exceptions; upsert on `{ studentId, attDate }`.

### `cache.service.js`
- Simple in-memory `Map` for today's menu (swap for Redis later if time allows). Invalidate on `PUT /mess/:date/:meal`.

---

## 6. Middleware and Cross-Cutting Concerns

- `middleware/auth.js` — verifies the JWT from `Authorization: Bearer <token>`, attaches `req.user`.
- `middleware/requireRole.js` — `requireRole('WARDEN', 'ADMIN')`, checked after `auth`.
- `middleware/validate.js` — runs a `zod` schema from `validators/` against `req.body`, `req.params`, or `req.query`.
- `middleware/errorHandler.js` — catches `ApiError` and unexpected errors, returns a consistent JSON shape; registered last in `app.js`.
- `utils/asyncHandler.js` — wraps every controller so rejected promises reach `errorHandler` instead of crashing the process.

---

## 7. Sockets (`sockets/index.js`)

- Verify the JWT on the Socket.io handshake (reuse the same secret as `middleware/auth.js`).
- On connect, join:
  - `user:<userId>` — personal events (ticket assigned, pass approved)
  - `role:WARDEN` — unassigned tickets, new gate pass requests
  - `hostel:<name>` — notices and emergency alerts targeted at that hostel
- Export small emit helpers (`emitToUser`, `emitToRole`, `emitToHostel`) so services don't touch the raw `io` object directly.

---

## 8. Scheduled Jobs (`jobs/`)

| Job | Schedule (IST) | Action |
|-----|------------------|--------|
| `nightlyReport.job.js` | 10:30 PM daily | Find passes with `status: 'EXITED'`, group by `hostel`, push list to each warden |
| `expirePasses.job.js` | Every 15–30 min | Find `APPROVED` passes past `expectedReturnTime` with no exit scan, set `status: 'EXPIRED'` |

Register both in `jobs/index.js`, called once from `index.js` after the DB connects. Use `node-cron`'s `timezone: 'Asia/Kolkata'` option rather than relying on the server's local time zone.

---

## 9. Seed Script (`scripts/seed.js`)

Create, in order:
1. A handful of `Location` documents (2 hostels, a few floors and rooms each).
2. 1 `ADMIN`, 2 `WARDEN` (one per hostel), 3 `TECHNICIAN` (one per category, with a `shifts` entry each), 2 `SECURITY`, about 20 `STUDENT` users assigned to rooms with `hostel`/`batch` set.
3. One sample `MessMenu` entry for today.

Hash passwords with `bcrypt` before inserting. Print the seeded phone numbers and a shared password to the console so the team can log in immediately.

---

## 10. Build Order

| Step | Task | Checkpoint |
|------|------|------------|
| 1 | `config/`, `models/`, `scripts/seed.js` | Seed script runs, data visible in Atlas/Compass |
| 2 | `middleware/`, `utils/jwt.js`, `auth` route + controller + schema | Can log in and get a JWT for each role |
| 3 | `ticket.service.js`, ticket route/controller, `sockets/index.js` | Complaint flow works end to end with live updates |
| 4 | `gatePass.service.js`, `utils/qrToken.js`, gate pass route/controller | Request → approve → QR → scan works |
| 5 | `jobs/` (nightly report, expiry) | Manual trigger works; cron fires on schedule |
| 6 | `notice.service.js`, `push.service.js` | Notice reaches the right room; emergency overlay trigger works |
| 7 | `mess` and `attendance` routes/services | Menu CRUD and roll call work |
| 8 | Deploy to Render/Railway, set env vars, whitelist IP in Atlas | Public API URL for the frontend to point at |

---

## 11. Cuts if Time Runs Short

Drop in this order: `attendance.service.js` and its route, `cache.service.js` (read `MessMenu` directly instead), `expirePasses.job.js`. Keep `ticket.service.js`, `gatePass.service.js`, `sockets/index.js`, and `nightlyReport.job.js` — these back the flows in the demo script.
