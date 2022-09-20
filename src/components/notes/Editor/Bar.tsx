import UINOTES from "../../UI";
import OpenEditor from "./OpenEditor";
import Tab from "./Tab";
import Editor from "./Editor";

export default function EditorsBar({ UI }: { UI: UINOTES }) {

    return (
        <>
            <div className="active-editors-tab-container">
                <div className="activeEditors">
                    {[...UI.state.Editors.entries()].sort(([ia, a], [ib, b]) => a.createdAt - b.createdAt)
                        .map(([id, item]) => {
                            return <Tab invoker={item} key={id} />
                        })}
                </div>
            </div>
            <div className="active-editors-container">
                {[...UI.state.Editors.entries()].map(([id, item]) => {
                    return <Editor invoker={item} key={item.temporalId ?? item.data.id} />
                })}
            </div>
        </>

    )
}