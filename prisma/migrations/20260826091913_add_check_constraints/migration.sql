-- Defense-in-depth backstop behind the transactional row-locking that owns
-- availability (ARCHITECTURE.md section 7). The real guarantee is the
-- locked transaction in the booking service; these CHECK constraints just
-- make it impossible for a bug or a direct DB write to push a counter past
-- capacity. Deferred here because Prisma's schema DSL has no CHECK syntax
-- (ARCHITECTURE.md section 4).

ALTER TABLE "ParaglidingSlot"
  ADD CONSTRAINT "ParaglidingSlot_bookedSeats_capacity_check"
  CHECK ("bookedSeats" >= 0 AND "bookedSeats" <= "capacity");

ALTER TABLE "TrainingBatch"
  ADD CONSTRAINT "TrainingBatch_bookedSeats_maxStudents_check"
  CHECK ("bookedSeats" >= 0 AND "bookedSeats" <= "maxStudents");

ALTER TABLE "RoomAvailability"
  ADD CONSTRAINT "RoomAvailability_bookedRooms_totalRooms_check"
  CHECK ("bookedRooms" >= 0 AND "bookedRooms" <= "totalRooms");
