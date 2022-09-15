import UINOTES from "../../UI";
import OpenEditor from "./OpenEditor";
import Tab from "./Tab";
import Editor from "./Editor";

export default function EditorsBar({ UI }: { UI: UINOTES }) {

    const EditorsEntries = [...UI.state.Editors.entries()];

    return (
        <>
            <div className="activeEditorsContainer">
                <div className="activeEditors">
                    {EditorsEntries.sort(([ia, a], [ib, b]) => a.createdAt - b.createdAt)
                        .map(([id, item]) => {
                            return <Tab invoker={item} key={id} />
                        })}
                </div>
            </div>
            <div className="Editors">
                {EditorsEntries.map(([id, item]: [string, OpenEditor]) => {
                    return <Editor invoker={item} key={item.temporalId ?? item.data.id} />
                })}
            </div>
        </>

    )
}