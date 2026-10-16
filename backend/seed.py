"""
Script de datos de demostración para CampusFlow.
Ejecutar desde la carpeta backend con el entorno virtual activo:
    python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.engine import SessionLocal
from app.models.user import User, UserRole
from app.models.space import Space, SpaceType
from app.models.equipment import Equipment, EquipmentCategory, EquipmentStatus
from app.models.incident import Incident, IncidentCategory, IncidentPriority, IncidentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.loan import Loan, LoanStatus
from app.core.security import hash_password
from datetime import datetime, timedelta, timezone


def seed():
    db = SessionLocal()
    try:
        # ── Verificar si ya existen datos ──────────────────────────────────
        if db.query(User).first():
            print("⚠️  Ya existen datos en la base de datos. Omitiendo seed.")
            print("   Si quieres recrearlos, borra las tablas y vuelve a ejecutar.")
            return

        print("🌱 Creando datos de demostración...")

        # ── Usuarios ───────────────────────────────────────────────────────
        admin = User(
            full_name="Administrador Campus",
            email="admin@campusflow.co",
            hashed_password=hash_password("Admin1234!"),
            role=UserRole.admin,
        )
        staff = User(
            full_name="Carlos Pérez",
            email="staff@campusflow.co",
            hashed_password=hash_password("Staff1234!"),
            role=UserRole.staff,
        )
        student1 = User(
            full_name="Ana García",
            email="ana@campusflow.co",
            hashed_password=hash_password("Student1234!"),
            role=UserRole.student,
        )
        student2 = User(
            full_name="Luis Martínez",
            email="luis@campusflow.co",
            hashed_password=hash_password("Student1234!"),
            role=UserRole.student,
        )
        db.add_all([admin, staff, student1, student2])
        db.flush()
        print("  ✅ Usuarios creados")

        # ── Espacios reales de Campuslands ────────────────────────────────
        spaces = [
            Space(name="Auditorio", space_type=SpaceType.classroom, location="Edificio principal",
                  capacity=100, description="Auditorio principal para eventos y conferencias",
                  amenities="proyector,sonido,aire acondicionado,escenario,sillas fijas"),
            Space(name="Cosmos", space_type=SpaceType.lab, location="Bloque tecnología",
                  capacity=25, description="Sala de innovación y desarrollo tecnológico",
                  amenities="computadores,proyector,aire acondicionado,tablero"),
            Space(name="Skilab", space_type=SpaceType.lab, location="Bloque tecnología",
                  capacity=20, description="Laboratorio de habilidades tecnológicas",
                  amenities="computadores,proyector,aire acondicionado"),
            Space(name="Spooki", space_type=SpaceType.classroom, location="Bloque A",
                  capacity=38, description="Aula de formación Spooki",
                  amenities="proyector,tablero,aire acondicionado"),
            Space(name="Apolo", space_type=SpaceType.classroom, location="Bloque A",
                  capacity=34, description="Aula de formación Apolo",
                  amenities="proyector,tablero,aire acondicionado"),
            Space(name="Blanca", space_type=SpaceType.meeting_room, location="Bloque B",
                  capacity=12, description="Sala de reuniones Blanca",
                  amenities="proyector,tablero,videoconferencia"),
            Space(name="Azul", space_type=SpaceType.cubicle, location="Bloque B",
                  capacity=10, description="Sala de trabajo colaborativo Azul",
                  amenities="tablero,televisor"),
            Space(name="Amarillas Verdes", space_type=SpaceType.cubicle, location="Bloque C",
                  capacity=6, description="Cubículos de trabajo grupal",
                  amenities="tablero"),
            Space(name="Artemis", space_type=SpaceType.classroom, location="Bloque A",
                  capacity=32, description="Aula de formación Artemis",
                  amenities="proyector,tablero,aire acondicionado"),
        ]
        db.add_all(spaces)
        db.flush()
        print("  ✅ Espacios creados")

        # ── Equipos ────────────────────────────────────────────────────────
        equipment_list = [
            Equipment(inventory_code="LAP-001", name="Laptop Dell XPS 13", category=EquipmentCategory.laptop,
                      description="Intel Core i7, 16GB RAM, 512GB SSD"),
            Equipment(inventory_code="LAP-002", name="Laptop Lenovo ThinkPad", category=EquipmentCategory.laptop,
                      description="Intel Core i5, 8GB RAM, 256GB SSD"),
            Equipment(inventory_code="LAP-003", name="MacBook Air M2", category=EquipmentCategory.laptop,
                      description="Apple M2, 8GB RAM, 256GB SSD"),
            Equipment(inventory_code="PRO-001", name="Proyector Epson", category=EquipmentCategory.projector,
                      description="Full HD 3500 lúmenes"),
            Equipment(inventory_code="PRO-002", name="Proyector BenQ", category=EquipmentCategory.projector,
                      description="Full HD 3000 lúmenes"),
            Equipment(inventory_code="CAM-001", name="Cámara Sony ZV-E10", category=EquipmentCategory.camera,
                      description="Cámara mirrorless para grabación"),
            Equipment(inventory_code="TAB-001", name="iPad Pro 12.9", category=EquipmentCategory.tablet,
                      description="Apple iPad Pro con Apple Pencil"),
            Equipment(inventory_code="CBL-001", name="Cable HDMI 2m", category=EquipmentCategory.cable,
                      description="Cable HDMI 2.0 de 2 metros"),
            Equipment(inventory_code="CBL-002", name="Adaptador USB-C HDMI", category=EquipmentCategory.cable,
                      description="Adaptador multipuerto USB-C"),
        ]
        db.add_all(equipment_list)
        db.flush()
        print("  ✅ Equipos creados")

        # ── Reservas de ejemplo ────────────────────────────────────────────
        now = datetime.now(timezone.utc)
        reservations = [
            Reservation(
                user_id=student1.id, space_id=spaces[0].id,
                title="Sesión de estudio grupal",
                purpose="Preparación para examen de algoritmos",
                attendees_count=8,
                start_time=now + timedelta(hours=2),
                end_time=now + timedelta(hours=4),
                status=ReservationStatus.approved,
            ),
            Reservation(
                user_id=student2.id, space_id=spaces[2].id,
                title="Práctica de base de datos",
                purpose="Proyecto final semestre",
                attendees_count=5,
                start_time=now + timedelta(days=1, hours=1),
                end_time=now + timedelta(days=1, hours=3),
                status=ReservationStatus.pending,
            ),
            Reservation(
                user_id=student1.id, space_id=spaces[4].id,
                title="Reunión de equipo hackaton",
                purpose="Planificación CampusFlow",
                attendees_count=4,
                start_time=now - timedelta(hours=3),
                end_time=now - timedelta(hours=1),
                status=ReservationStatus.finished,
            ),
        ]
        db.add_all(reservations)
        db.flush()
        print("  ✅ Reservas creadas")

        # ── Préstamos de ejemplo ───────────────────────────────────────────
        equipment_list[0].status = EquipmentStatus.loaned
        loan = Loan(
            user_id=student2.id,
            equipment_id=equipment_list[0].id,
            purpose="Desarrollo de proyecto final",
            status=LoanStatus.delivered,
            requested_return_date=now + timedelta(days=2),
            delivered_at=now - timedelta(hours=5),
        )
        db.add(loan)
        db.flush()
        print("  ✅ Préstamos creados")

        # ── Incidencias de ejemplo ─────────────────────────────────────────
        incidents = [
            Incident(
                reporter_id=student1.id,
                title="Proyector del Aula 101 no enciende",
                description="El proyector no responde al encender. Se probó con diferentes cables y fuentes.",
                category=IncidentCategory.hardware,
                priority=IncidentPriority.high,
                status=IncidentStatus.assigned,
                location="Aula 101 - Bloque A",
                assigned_to_id=staff.id,
            ),
            Incident(
                reporter_id=student2.id,
                title="Internet muy lento en Laboratorio 2",
                description="La conexión WiFi del Lab 2 es muy lenta desde esta mañana. Afecta el trabajo de todos.",
                category=IncidentCategory.network,
                priority=IncidentPriority.medium,
                status=IncidentStatus.open,
                location="Laboratorio 2 - Bloque B",
            ),
            Incident(
                reporter_id=student1.id,
                title="Silla rota en Cubículo 1",
                description="Una de las sillas tiene una pata suelta y representa un riesgo.",
                category=IncidentCategory.infrastructure,
                priority=IncidentPriority.low,
                status=IncidentStatus.resolved,
                location="Cubículo 1 - Bloque C",
                assigned_to_id=staff.id,
            ),
        ]
        db.add_all(incidents)
        db.commit()
        print("  ✅ Incidencias creadas")

        print("\n✅ Datos de demostración creados exitosamente.")
        print("\n📋 Cuentas de demostración:")
        print("   👤 Administrador: admin@campusflow.co  /  Admin1234!")
        print("   👤 Personal:      staff@campusflow.co  /  Staff1234!")
        print("   👤 Estudiante 1:  ana@campusflow.co    /  Student1234!")
        print("   👤 Estudiante 2:  luis@campusflow.co   /  Student1234!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error al crear datos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
