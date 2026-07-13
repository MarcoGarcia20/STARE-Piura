import { useEffect } from 'react';
import { useOrganizationStore, useEventStore } from '@/stores';
import type { Organization as LocalOrg, SocialEvent as LocalEvent, EventStatus as LocalStatus } from '../types/organization';
import type { PiuraDistrict } from '@/types/index';

export const useOrganizationManagement = () => {
  const {
    organizations: storeOrgs,
    fetchOrganizations,
    addOrganization: storeAddOrg,
    updateOrganization: storeUpdateOrg,
    deleteOrganization: storeDeleteOrg,
  } = useOrganizationStore();


  const {
    events: storeEvents,
    fetchEvents,
    addEvent: storeAddEvent,
    updateEvent: storeUpdateEvent,
  } = useEventStore();

  // Cargar datos en el montaje para que el almacén esté al día
  useEffect(() => {
    fetchOrganizations();
    fetchEvents();
  }, [fetchOrganizations, fetchEvents]);

  // 1. Mapear de base de datos a formato de componente antiguo (Adapter Pattern)
  const organizations: LocalOrg[] = storeOrgs.map((org) => ({
    id: org.id,
    nombre: org.nombre,
    direccion: org.direccion,
    sector_demografico: org.tipo === 'comedor'
      ? 'Comedor Popular'
      : org.tipo === 'asilo'
      ? 'Hogar del Adulto Mayor'
      : org.tipo === 'vaso_de_leche'
      ? 'Vaso de Leche'
      : 'Organización Beneficiaria',
    deficiencias_infraestructura: org.necesidades,
    distrito: org.distrito,
  }));

  const orgEvents: LocalEvent[] = storeEvents
    .filter((e) => e.organization_id)
    .map((e) => ({
      id: e.id,
      organization_id: e.organization_id!,
      fecha_programada: e.start_time.split('T')[0],
      tipo_intervencion: e.title.toLowerCase().includes('infraestructura')
        ? 'infraestructura'
        : e.title.toLowerCase().includes('educación')
        ? 'educativa'
        : 'acompañamiento',
      estado: e.status === 'realizada'
        ? 'completado'
        : e.status === 'en_curso'
        ? 'en curso'
        : 'pendiente',
      voluntarios_requeridos: 5, // fallback representativo
    }));

  // 2. Acciones mutadoras con actualización optimista (síncronas para el UI, asíncronas para el backend)
  const addOrganization = (org: Omit<LocalOrg, 'id'>): LocalOrg => {
    const generatedId = `org-${Date.now()}`;
    const localNewOrg: LocalOrg = {
      ...org,
      id: generatedId,
    };

    const tipo = org.sector_demografico.toLowerCase().includes('comedor')
      ? 'comedor'
      : org.sector_demografico.toLowerCase().includes('asilo')
      ? 'asilo'
      : org.sector_demografico.toLowerCase().includes('vaso')
      ? 'vaso_de_leche'
      : 'otro';

    // Despachar llamada asíncrona al store
    storeAddOrg({
      nombre: org.nombre,
      tipo: tipo as any,
      direccion: org.direccion,
      distrito: org.distrito as PiuraDistrict,
      encargado: 'Encargado Principal',
      beneficiarios_estimados: 60,
      necesidades: org.deficiencias_infraestructura,
    }).catch(console.error);

    return localNewOrg;
  };

  const addSocialEvent = (event: Omit<LocalEvent, 'id'>): LocalEvent => {
    const generatedId = `ev-${Date.now()}`;
    const localNewEvent: LocalEvent = {
      ...event,
      id: generatedId,
    };

    const org = storeOrgs.find((o) => o.id === event.organization_id);
    const distrito = org ? org.distrito : 'Piura Centro';

    // Despachar llamada asíncrona al store
    storeAddEvent({
      organization_id: event.organization_id,
      organization_nombre: org?.nombre || 'Organización',
      title: `Intervención de ${event.tipo_intervencion}`,
      description: `Jornada planificada para apoyar a la organización.`,
      distrito: distrito as PiuraDistrict,
      target_audience: org?.tipo || 'Población general',
      start_time: `${event.fecha_programada}T09:00:00`,
      end_time: `${event.fecha_programada}T17:00:00`,
    }).catch(console.error);

    return localNewEvent;
  };

  const updateEventStatus = (eventId: string, status: LocalStatus): void => {
    const mappedStatus = status === 'completado'
      ? 'realizada'
      : status === 'en curso'
      ? 'en_curso'
      : 'programada';

    storeUpdateEvent(eventId, {
      status: mappedStatus as any,
    }).catch(console.error);
  };

  const updateOrganization = (orgId: string, updatedOrg: Partial<Omit<LocalOrg, 'id'>>): void => {
    const dto: any = {};
    if (updatedOrg.nombre !== undefined) dto.nombre = updatedOrg.nombre;
    if (updatedOrg.direccion !== undefined) dto.direccion = updatedOrg.direccion;
    if (updatedOrg.deficiencias_infraestructura !== undefined) dto.necesidades = updatedOrg.deficiencias_infraestructura;
    if (updatedOrg.distrito !== undefined) dto.distrito = updatedOrg.distrito as PiuraDistrict;
    if (updatedOrg.sector_demografico !== undefined) {
      dto.tipo = updatedOrg.sector_demografico.toLowerCase().includes('comedor')
        ? 'comedor'
        : updatedOrg.sector_demografico.toLowerCase().includes('asilo')
        ? 'asilo'
        : updatedOrg.sector_demografico.toLowerCase().includes('vaso')
        ? 'vaso_de_leche'
        : 'otro';
    }
    storeUpdateOrg(orgId, dto).catch(console.error);
  };

  const deleteOrganization = (orgId: string): void => {
    storeDeleteOrg(orgId).catch(console.error);
  };

  return {
    organizations,
    orgEvents,
    addOrganization,
    updateOrganization,
    addSocialEvent,
    updateEventStatus,
    deleteOrganization,
  };
};

