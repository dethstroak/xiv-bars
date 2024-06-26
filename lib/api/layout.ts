import db from 'lib/db';
import { maxLayouts } from 'lib/user';
import type { LayoutDataProps, LayoutViewProps } from 'types/Layout';

type LayoutID = string;
type UserID = number | undefined;

export async function list(userId:UserID):Promise<LayoutViewProps[]> {
  const layouts = await db.layout.findMany({
    where: { userId },
    include: {
      user: {
        select: { name: true }
      },
      _count: {
        select: { hearts: true }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: maxLayouts
  });

  return layouts;
}

export async function create(
  userId:UserID,
  data:LayoutDataProps
):Promise<LayoutDataProps> {
  const userLayouts = await db.layout
    .findMany({ where: { userId } })
    .catch((error:Error) => {
      console.error(error);
      throw new Error('Could not create new layout.');
    });

  if (userLayouts.length > maxLayouts) {
    throw new Error('Max number of layouts reached.');
  } else {
    const createLayout = await db.layout
      .create({
        data: { ...data, userId },
        include: { user: { select: { name: true } } }
      })
      .catch((error:Error) => console.error(error));
    return createLayout;
  }
}

export async function read(
  id: LayoutID,
  userId: UserID | undefined
):Promise<LayoutViewProps> {
  if (!id) throw new Error('Layout not found');

  const layoutId = parseInt(id, 10);
  const hearted = await db.heart.findFirst({ where: { userId, layoutId } });
  const viewData = await db.layout
    .findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        user: {
          select: { name: true, id: true }
        },
        _count: {
          select: { hearts: true }
        }
      }
    }).catch((error:Error) => {
      console.error(error);
      return new Error('Could not read layout.');
    });

  return { ...viewData, hearted: hearted || undefined };
}

export async function update(data:LayoutDataProps):Promise<LayoutDataProps> {
  const { id } = data;
  const today = new Date().toISOString();
  const viewData = { ...data, updatedAt: today };

  const updatedLayout = await db.layout
    .update({
      where: { id },
      data: viewData,
      include: { user: { select: { name: true, id: true } } }
    })
    .catch((error:Error) => {
      console.error(error);
      throw new Error('Could not update layout.');
    });

  return updatedLayout;
}

export async function destroy(userId: UserID, { id }: { id:LayoutID }) {
  if (!userId || !id) throw new Error('Layout not found');
  await db.layout
    .deleteMany({ where: { id, userId } })
    .catch((error:Error) => {
      console.error(error);
      throw new Error('Could not delete layout.');
    });

  const newList = await list(userId);
  return newList;
}

const layoutsApi = {
  list, create, read, update, destroy
};

export default layoutsApi;
