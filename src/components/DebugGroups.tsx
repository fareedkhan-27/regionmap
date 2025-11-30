"use client";

import React, { useState, useCallback } from "react";

interface Group {
  id: string;
  name: string;
  color: string;
}

let counter = 1;
function generateId() {
  counter++;
  return `group-${counter}`;
}

export default function DebugGroups() {
  const [groups, setGroups] = useState<Group[]>([
    { id: "group-1", name: "Group 1", color: "#2A9D8F" }
  ]);
  const [activeId, setActiveId] = useState<string>("group-1");
  const [inputs, setInputs] = useState<Record<string, string>>({ "group-1": "" });

  const addGroup = useCallback(() => {
    const newId = generateId();
    setGroups(prev => [...prev, { id: newId, name: `Group ${prev.length + 1}`, color: "#E76F51" }]);
    setInputs(prev => ({ ...prev, [newId]: "" }));
    setActiveId(newId);
  }, []);

  const removeGroup = useCallback((id: string) => {
    if (groups.length <= 1) return;
    
    const remaining = groups.filter(g => g.id !== id);
    setGroups(remaining);
    setInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
    if (activeId === id) {
      setActiveId(remaining[0].id);
    }
  }, [groups, activeId]);

  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Groups</h1>
      
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm font-mono">
        <div>Active ID: {activeId}</div>
        <div>Groups: {JSON.stringify(groups.map(g => g.id))}</div>
        <div>Inputs: {JSON.stringify(inputs)}</div>
      </div>

      <button 
        onClick={addGroup}
        className="mb-4 px-4 py-2 bg-teal-500 text-white rounded"
      >
        Add Group
      </button>

      <div className="space-y-2">
        {groups.map(group => (
          <div
            key={group.id}
            onClick={() => setActiveId(group.id)}
            className={`p-3 border-2 rounded cursor-pointer ${
              activeId === group.id 
                ? "border-teal-500 bg-teal-50" 
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">{group.name} (ID: {group.id})</span>
              {groups.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGroup(group.id);
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <textarea
              value={inputs[group.id] ?? ""}
              onChange={(e) => setInputs(prev => ({ ...prev, [group.id]: e.target.value }))}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(group.id);
              }}
              className="w-full p-2 border rounded"
              placeholder="Type here..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
