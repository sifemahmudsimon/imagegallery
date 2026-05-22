import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
import { BiImage } from "react-icons/bi";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ================= SORTABLE IMAGE ================= */

const SortableImage = ({
  image,
  index,
  hoveredIndex,
  setHoveredIndex,
  toggleSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,

    gridColumn: index === 0 ? "span 2" : "span 1",
    gridRow: index === 0 ? "span 2" : "span 1",

    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    aspectRatio: "1 / 1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <input
        type="checkbox"
        checked={image.selected}
        onChange={() => toggleSelect(image.key)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 2,
        }}
      />

      <img
        src={image.src}
        alt={image.alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: hoveredIndex === index ? "brightness(0.5)" : "none",
        }}
      />
    </div>
  );
};

/* ================= MAIN ================= */

const ImagesGallery = () => {
  const [images, setImages] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  /* ================= LOAD DEFAULT ================= */

  const importAll = (r) => r.keys().map(r);
  const imageFiles = importAll(
    require.context("../assets/image", false, /\.(png|jpe?g|gif|svg|webp)$/)
  );

  useEffect(() => {
    const initial = imageFiles.map((img, i) => ({
      src: img,
      key: `img-${i}`,
      selected: false,
    }));
    setImages(initial);
  }, []);

  /* ================= DRAG REORDER ================= */

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.key === active.id);
    const newIndex = images.findIndex((i) => i.key === over.id);

    setImages(arrayMove(images, oldIndex, newIndex));
  };

  /* ================= SELECT ================= */

  const toggleSelect = (key) => {
    setImages((prev) =>
      prev.map((img) =>
        img.key === key ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const selectedCount = images.filter((i) => i.selected).length;

  const allSelected = images.length > 0 && images.every((img) => img.selected);

  const toggleSelectAll = () => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        selected: !allSelected,
      }))
    );
  };

  const handleDelete = () => {
    setImages((prev) => prev.filter((img) => !img.selected));
  };

  /* ================= ADD IMAGE ================= */

  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file, i) => ({
      src: URL.createObjectURL(file),
      key: `new-${Date.now()}-${i}`,
      selected: false,
    }));

    // ✅ ADD AT LAST (FIXED)
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  /* ================= DROP ZONE ================= */

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ================= UI ================= */

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-secondary">
      <Card style={{ maxWidth: "70%", width: "100%" }}>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h3>{selectedCount > 0 ? `${selectedCount} Selected` : "Gallery"}</h3>

          <div className="d-flex gap-2">
            <Button color="secondary" onClick={toggleSelectAll}>
              {allSelected ? "Unselect All" : "Select All"}
            </Button>

            {selectedCount > 0 && (
              <Button color="danger" onClick={handleDelete}>
                Delete Selected
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {/* hidden input */}
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            id="fileInput"
            onChange={handleFileInput}
          />

          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext
              items={images.map((i) => i.key)}
              strategy={rectSortingStrategy}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "1.2rem",
                  gridAutoRows: "1fr",
                }}
              >
                {/* ================= IMAGES ================= */}
                {images.map((img, i) => (
                  <SortableImage
                    key={img.key}
                    image={img}
                    index={i}
                    hoveredIndex={hoveredIndex}
                    setHoveredIndex={setHoveredIndex}
                    toggleSelect={toggleSelect}
                  />
                ))}

                {/* ================= DROP ZONE ================= */}
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDraggingFile
                      ? "2px dashed black"
                      : "1px dashed lightgrey",
                    borderRadius: "10px",
                    aspectRatio: "1 / 1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isDraggingFile ? "#f0f0f0" : "#f8f9fa",
                    transition: "0.2s",
                    color: "black",
                    fontWeight: 500,
                  }}
                >
                  <BiImage size={30} />

                  {isDraggingFile ? (
                    <h6 style={{ marginTop: 8 }}>Drop Here</h6>
                  ) : (
                    <h6 style={{ marginTop: 8 }}>Add / Drop Image</h6>
                  )}
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </CardBody>
      </Card>
    </div>
  );
};

export default ImagesGallery;
