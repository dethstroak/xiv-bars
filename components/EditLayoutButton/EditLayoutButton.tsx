import { useSession } from 'next-auth/react';
import { useAppState, useAppDispatch } from 'components/App/context';
import { AppAction } from 'components/App/actions';
import Icon, { Icons } from 'components/Icon';

export default function EditLayoutButton() {
  const { data: session } = useSession();
  const { layoutId, readOnly, user } = useAppState();
  const appDispatch = useAppDispatch();
  const canEdit = session?.user.id === user?.id;

  if (!layoutId || !session || !canEdit) return null;

  function handleEditLayout() {
    appDispatch({ type: AppAction.EDIT_LAYOUT });
  }

  return (
    <button
      type="button"
      className="button btn-icon"
      onClick={handleEditLayout}
      data-title="Edit Layout"
      data-title-anchor="right"
      disabled={!readOnly}
    >
      <Icon id={Icons.EDIT} alt="Edit" />
      <span className="btn-label-hidden">Edit</span>
    </button>
  );
}
